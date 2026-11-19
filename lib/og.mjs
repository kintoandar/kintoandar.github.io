// Generates a 1200x630 social preview card per post (title, date and teaser image),
// using the colours of www.kintoandar.com. Cards are cached in .cache/og by content hash.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const PAD = 80;
const VERSION = 1; // bump to regenerate every card after a design change

const COLORS = { band: '#141c2e', ink: '#f3efe6', muted: '#aab1c2', accent: '#ff8a65', paper: '#fbfaf7' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// resvg has no text measurement, so wrap on an average glyph width for Source Serif Bold
function wrap(text, size, maxWidth) {
  const perLine = Math.floor(maxWidth / (size * 0.52));
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitTitle(title, maxWidth) {
  for (const size of [72, 64, 56, 48]) {
    const lines = wrap(title, size, maxWidth);
    if (lines.length <= 4) return { size, lines };
  }
  const lines = wrap(title, 48, maxWidth).slice(0, 4);
  lines[3] = `${lines[3].replace(/\s*\S+$/, '')}…`;
  return { size: 48, lines };
}

async function teaserDataUri(file) {
  const png = await sharp(file).resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

async function svgFor({ title, label, footer, teaser }) {
  const textWidth = teaser ? 620 : W - PAD * 2;
  const { size, lines } = fitTitle(title, textWidth);
  const lineHeight = Math.round(size * 1.15);
  const top = 215 + Math.max(0, (4 - lines.length) * lineHeight * 0.25);

  const titleSvg = lines
    .map((l, i) => `<tspan x="${PAD}" y="${top + i * lineHeight}">${esc(l)}</tspan>`)
    .join('');

  const card = teaser
    ? `<rect x="760" y="${PAD + 20}" width="360" height="390" rx="18" fill="${COLORS.paper}"/>
       <image x="784" y="${PAD + 44}" width="312" height="342" preserveAspectRatio="xMidYMid meet" href="${await teaserDataUri(teaser)}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${COLORS.band}"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${COLORS.accent}"/>
  <text x="${PAD}" y="${PAD + 40}" font-family="Source Sans 3" font-weight="600" font-size="26" letter-spacing="3" fill="${COLORS.accent}">${esc(label.toUpperCase())}</text>
  <text font-family="Source Serif 4" font-weight="700" font-size="${size}" fill="${COLORS.ink}">${titleSvg}</text>
  <text x="${PAD}" y="${H - PAD}" font-family="Source Sans 3" font-size="28" fill="${COLORS.muted}">${esc(footer)}</text>
  ${card}
</svg>`;
}

export function createOgRenderer({ fontsDir, staticDir, outDir, cacheDir }) {
  const fontFiles = fs.readdirSync(fontsDir).filter((f) => f.endsWith('.ttf')).map((f) => path.join(fontsDir, f));
  const ogCache = path.join(cacheDir, 'og');
  fs.mkdirSync(ogCache, { recursive: true });

  // Writes the card to <outDir><url> and returns url
  return async function render(url, { title, label, footer, teaser }) {
    const teaserFile = teaser && path.join(staticDir, teaser);
    const teaserPath = teaserFile && fs.existsSync(teaserFile) ? teaserFile : null;
    const hash = crypto.createHash('sha1')
      .update(JSON.stringify({ VERSION, title, label, footer }))
      .update(teaserPath ? fs.readFileSync(teaserPath) : '')
      .digest('hex');
    const cached = path.join(ogCache, `${hash}.png`);

    if (!fs.existsSync(cached)) {
      const svg = await svgFor({ title, label, footer, teaser: teaserPath });
      const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Source Sans 3' } })
        .render()
        .asPng();
      fs.writeFileSync(cached, png);
    }

    const out = path.join(outDir, url);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(cached, out);
    return url;
  };
}
