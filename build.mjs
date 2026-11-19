#!/usr/bin/env node
// Static site generator for blog.kintoandar.com
//
//   node build.mjs           build into _site/
//   node build.mjs --serve   build, serve on http://localhost:4000 and rebuild on change

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import anchor from 'markdown-it-anchor';
import hljs from 'highlight.js';
import { createImageOptimizer } from './lib/images.mjs';
import { createOgRenderer } from './lib/og.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, '_site');
const POSTS_DIR = path.join(ROOT, 'posts');
const PAGES_DIR = path.join(ROOT, 'pages');
const STATIC_DIR = path.join(ROOT, 'static');
const THEME_DIR = path.join(ROOT, 'theme');
const CACHE_DIR = path.join(ROOT, '.cache');

// ---------------------------------------------------------------------------
// Markdown

// Mirrors kramdown's auto_ids so existing #fragment links keep working
const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');

let headings = [];

const md = new MarkdownIt({
  html: true,
  typographer: true,
})
  .use(attrs, { allowedAttributes: ['id', 'class'] })
  .use(anchor, {
    slugify,
    tabIndex: false,
    callback: (token, { slug, title }) => headings.push({ level: Number(token.tag.slice(1)), slug, title }),
  });

// Fenced code: highlighted at build time and wrapped with a language label (copy button added by theme JS)
md.renderer.rules.fence = (tokens, idx) => {
  const { content, info } = tokens[idx];
  const lang = info.trim().split(/\s+/)[0];
  const known = lang && hljs.getLanguage(lang);
  const body = known
    ? hljs.highlight(content, { language: lang, ignoreIllegals: true }).value
    : md.utils.escapeHtml(content);
  const label = lang ? `<figcaption>${md.utils.escapeHtml(lang)}</figcaption>` : '<figcaption></figcaption>';
  return `<figure class="code">${label}<pre><code class="hljs${lang ? ` language-${md.utils.escapeHtml(lang)}` : ''}">${body}</code></pre></figure>\n`;
};

function renderMarkdown(src) {
  headings = [];
  const html = md.render(src);
  return { html, headings };
}

// ---------------------------------------------------------------------------
// Content loading

function readDoc(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  return { data: loadYaml(m[1]) || {}, body: m[2] };
}

const pad = (n) => String(n).padStart(2, '0');

function toDate(value, fallback) {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return fallback;
}

function countWords(html) {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function loadPosts(site) {
  const posts = fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const m = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      if (!m) throw new Error(`posts/${file}: expected YYYY-MM-DD-slug.md`);
      const [, fileDate, slug] = m;
      const { data, body } = readDoc(path.join(POSTS_DIR, file));
      const date = toDate(data.date, new Date(`${fileDate}T00:00:00Z`));
      const { html, headings } = renderMarkdown(body);
      const dir = `/${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}`;
      const words = countWords(html);
      return {
        ...data,
        file,
        slug,
        date,
        id: `${dir}/${slug}`,
        url: `${dir}/${slug}.html`,
        tags: data.tags || [],
        teaser: data.header?.teaser,
        content: html,
        headings,
        readTime: Math.max(1, Math.round(words / site.words_per_minute)),
      };
    })
    .sort((a, b) => b.date - a.date || b.file.localeCompare(a.file));

  posts.forEach((post, i) => {
    post.newer = posts[i - 1];
    post.older = posts[i + 1];
    post.related = relatedPosts(post, posts);
  });
  return posts;
}

// Most shared tags first, newest as tie-breaker
function relatedPosts(post, posts, limit = 4) {
  return posts
    .filter((p) => p !== post)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.date - a.p.date)
    .slice(0, limit)
    .map(({ p }) => p);
}

function loadPages() {
  return fs.readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, body } = readDoc(path.join(PAGES_DIR, file));
      const name = path.basename(file, '.md');
      const { html } = renderMarkdown(body);
      return {
        ...data,
        url: data.permalink || `/${name}.html`,
        hero: data.header?.image,
        content: html,
      };
    });
}

function groupByTag(posts) {
  const tags = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tags.has(tag)) tags.set(tag, []);
      tags.get(tag).push(post);
    }
  }
  return [...tags.entries()]
    .map(([name, list]) => ({ name, slug: slugify(name), posts: list }))
    .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Output

function writeFile(url, contents) {
  const rel = url.endsWith('/') ? `${url}index.html` : url;
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

async function build() {
  const started = Date.now();
  // Cache-busting import so the dev server picks up template edits
  const theme = await import(`./theme/templates.mjs?t=${started}`);
  const site = loadYaml(fs.readFileSync(path.join(ROOT, 'site.yml'), 'utf8'));
  site.url = site.url.replace(/\/$/, '');
  site.year = new Date().getFullYear();

  const posts = loadPosts(site);
  const pages = loadPages();
  const tags = groupByTag(posts);

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(STATIC_DIR, OUT, { recursive: true });
  fs.copyFileSync(path.join(THEME_DIR, 'style.css'), path.join(OUT, 'style.css'));

  const renderOg = createOgRenderer({ fontsDir: path.join(THEME_DIR, 'fonts'), staticDir: STATIC_DIR, outDir: OUT, cacheDir: CACHE_DIR });
  await Promise.all(posts.map(async (post) => {
    const date = post.date.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
    post.image = await renderOg(`/og${post.id}.png`, {
      title: post.title,
      label: new URL(site.url).host,
      footer: `${site.author.name}  ·  ${date}`,
      teaser: post.teaser,
    });
  }));

  // HTML pages go through the image optimizer before being written
  const htmlPages = [];
  const write = (url, contents) => htmlPages.push([url, contents]);

  for (const post of posts) write(post.url, theme.post(site, post));
  for (const page of pages) write(page.url, theme.page(site, page));

  const perPage = site.paginate;
  const total = Math.ceil(posts.length / perPage);
  for (let n = 1; n <= total; n++) {
    const pager = {
      current: n,
      total,
      url: (i) => (i === 1 ? '/' : `/page${i}/`),
    };
    write(pager.url(n), theme.home(site, posts.slice((n - 1) * perPage, n * perPage), pager));
  }

  write('/posts/', theme.archive(site, posts));
  write('/tags/', theme.tags(site, tags));
  writeFile('/feed.xml', theme.feed(site, posts.slice(0, 10)));

  const sitemapUrls = [
    ...posts.map((p) => ({ url: p.url, date: p.date })),
    ...pages.filter((p) => p.sitemap !== false).map((p) => ({ url: p.url })),
    { url: '/' }, { url: '/posts/' }, { url: '/tags/' },
  ];
  writeFile('/sitemap.xml', theme.sitemap(site, sitemapUrls));

  const images = createImageOptimizer({ staticDir: STATIC_DIR, outDir: OUT, cacheDir: CACHE_DIR });
  await Promise.all(htmlPages.map(async ([url, html]) => writeFile(url, await images.transform(html))));
  images.save();

  console.log(`Built ${posts.length} posts, ${pages.length} pages in ${Date.now() - started}ms`);
}

// ---------------------------------------------------------------------------
// Dev server

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.xml': 'application/xml', '.json': 'application/json', '.txt': 'text/plain',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg',
};

function serve(port = 4000) {
  http.createServer((req, res) => {
    let file = path.join(OUT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(OUT)) file = OUT;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'content-type': MIME['.html'] });
      return fs.createReadStream(path.join(OUT, '404.html')).pipe(res);
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`Serving on http://localhost:${port}`));

  let timer;
  for (const dir of [POSTS_DIR, PAGES_DIR, STATIC_DIR, THEME_DIR, path.join(ROOT, 'site.yml')]) {
    fs.watch(dir, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch(console.error), 100);
    });
  }
}

await build();
if (process.argv.includes('--serve')) serve();
