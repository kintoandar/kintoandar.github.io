// Post-processes generated HTML so every local raster image gets:
//   - width/height attributes (no layout shift while loading)
//   - lazy loading, except images marked fetchpriority="high"
//   - a WebP variant served through <picture>, capped at MAX_WIDTH, when it is meaningfully smaller
//
// Original files and URLs are untouched; WebP files are written next to them in the output.
// Results are cached in .cache/ keyed on the source file's content hash.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 1600;
const MIN_SAVING = 0.9; // only use WebP when it is at most 90% of the original size

export function createImageOptimizer({ staticDir, outDir, cacheDir }) {
  const manifestFile = path.join(cacheDir, 'manifest.json');
  const cacheImages = path.join(cacheDir, 'images');
  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')); } catch { /* first run */ }
  const pending = new Map();

  // Resolves to { width, height, webp } for a site URL like /images/foo.png, or null
  function inspect(url) {
    if (!pending.has(url)) pending.set(url, optimize(url));
    return pending.get(url);
  }

  async function optimize(url) {
    const src = path.join(staticDir, url);
    if (!src.startsWith(staticDir) || !fs.existsSync(src)) return null;
    const stat = fs.statSync(src);
    const key = crypto.createHash('sha1').update(fs.readFileSync(src)).digest('hex');
    const webpRel = url.replace(/\.(png|jpe?g)$/i, '.webp');
    const cached = path.join(cacheImages, webpRel);

    let entry = manifest[url];
    if (entry?.key !== key || (entry.webp && !fs.existsSync(cached))) {
      const meta = await sharp(src).metadata();
      const width = Math.min(meta.width, MAX_WIDTH);
      const height = Math.round(meta.height * (width / meta.width));
      const buf = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      const webp = buf.length <= stat.size * MIN_SAVING;
      if (webp) {
        fs.mkdirSync(path.dirname(cached), { recursive: true });
        fs.writeFileSync(cached, buf);
      }
      entry = manifest[url] = { key, width, height, webp };
    }

    if (entry.webp) {
      const out = path.join(outDir, webpRel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(cached, out);
    }
    return { ...entry, webpUrl: entry.webp ? webpRel : null };
  }

  async function transform(html) {
    const tags = [...html.matchAll(/<img\b[^>]*>/g)];
    const replacements = await Promise.all(tags.map(async ([tag]) => {
      const src = tag.match(/\ssrc="(\/[^"]+\.(?:png|jpe?g))"/i)?.[1];
      if (!src) return tag;
      const info = await inspect(decodeURI(src));
      if (!info) return tag;

      let img = tag;
      if (!/\swidth=/.test(img)) img = img.replace(/<img\b/, `<img width="${info.width}" height="${info.height}"`);
      if (!/\sloading=|fetchpriority=/.test(img)) img = img.replace(/<img\b/, '<img loading="lazy"');
      if (!/\sdecoding=/.test(img)) img = img.replace(/<img\b/, '<img decoding="async"');
      return info.webpUrl ? `<picture><source type="image/webp" srcset="${info.webpUrl}">${img}</picture>` : img;
    }));

    let i = 0;
    return html.replace(/<img\b[^>]*>/g, () => replacements[i++]);
  }

  function save() {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
  }

  return { transform, inspect, save };
}
