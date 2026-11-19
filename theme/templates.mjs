// HTML templates for the blog. Each export returns a complete document as a string.

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const abs = (site, url) => (/^https?:/.test(url) ? url : site.url + url);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
const isoDate = (d) => d.toISOString().slice(0, 10);

// Feather-style stroke icons
const ICONS = {
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  tag: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};

const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

// ---------------------------------------------------------------------------
// Email: same approach as www.kintoandar.com. The HTML only has the spelled-out
// "user [at] domain [dot] tld" form and a LinkedIn fallback; a script assembles
// the real address so scrapers never see it.

function emailLink(site) {
  if (!site.author.email) return '';
  const [user, domain] = site.author.email.split('@');
  const spelled = `${user} [at] ${domain.replace(/\./g, ' [dot] ')}`;
  const fallback = site.author.links.find((l) => l.icon === 'linkedin')?.url || '#';
  return `<a href="${fallback}" data-email-user="${esc(user)}" data-email-domain="${esc(domain)}" title="${esc(spelled)}">${icon('mail')}<span>Email</span></a>`;
}

// Email is assembled here to keep it away from scrapers
const emailScript = `<script>
  document.querySelectorAll('[data-email-user]').forEach(function (a) {
    var addr = [a.dataset.emailUser, a.dataset.emailDomain].join('@');
    a.href = 'mailto:' + addr;
    a.title = addr;
  });
</script>`;

// Adds a copy button to every code block's label bar
const copyScript = `<script>
  document.querySelectorAll('figure.code').forEach(function (fig) {
    if (!navigator.clipboard) return;
    var btn = document.createElement('button');
    btn.className = 'code__copy';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(fig.querySelector('code').innerText).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });
    fig.querySelector('figcaption').appendChild(btn);
  });
</script>`;

// ---------------------------------------------------------------------------
// Shared chrome

function head(site, page) {
  const title = page.title ? `${page.title} - ${site.title}` : `${site.title} - ${site.description}`;
  const description = page.excerpt || site.description;
  const image = abs(site, page.image || site.og_image);
  const url = abs(site, page.url || '/');
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.author.name)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${page.date ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(site.title)}">
<meta property="og:title" content="${esc(page.title || site.title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
${page.date ? `<meta property="article:published_time" content="${page.date.toISOString()}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/atom+xml" title="${esc(site.title)}" href="/feed.xml">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="/style.css">
${site.cloudflare_analytics_token ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: site.cloudflare_analytics_token })}'></script>` : ''}
</head>`;
}

function masthead(site, current) {
  const links = site.nav
    .map((n) => `<a href="${n.url}"${current === n.url ? ' aria-current="page"' : ''}>${esc(n.title)}</a>`)
    .join('');
  return `<header class="masthead">
  <div class="masthead__inner">
    <a class="site-brand" href="/"><img src="${site.logo}" alt="" width="32" height="32" loading="eager"><span>${esc(site.title)}</span></a>
    <nav class="site-nav" aria-label="Main">${links}</nav>
  </div>
</header>`;
}

function hero(src) {
  return src ? `<div class="hero"><img src="${src}" alt="" fetchpriority="high"></div>` : '';
}

function authorCard(site) {
  const a = site.author;
  const links = a.links
    .map((l) => `<li><a href="${esc(l.url)}" rel="me">${icon(l.icon)}<span>${esc(l.label)}</span></a></li>`)
    .join('');
  const email = emailLink(site);
  return `<aside class="author" itemscope itemtype="https://schema.org/Person">
  <img class="author__avatar" src="${a.avatar}" alt="${esc(a.name)}" itemprop="image" width="110" height="110" loading="eager">
  <div class="author__body">
    <h2 class="author__name" itemprop="name">${esc(a.name)}</h2>
    <p class="author__bio" itemprop="description">${esc(a.bio)}</p>
    <ul class="author__links">${email ? `<li>${email}</li>` : ''}${links}</ul>
  </div>
</aside>`;
}

function footer(site) {
  const links = site.author.links
    .map((l) => `<a href="${esc(l.url)}">${icon(l.icon)}${esc(l.label)}</a>`)
    .join('');
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <nav class="site-footer__links"><strong>Follow:</strong>${links}<a href="/feed.xml">${icon('rss')}Feed</a></nav>
    <p>&copy; ${site.year} ${esc(site.title)}</p>
  </div>
</footer>`;
}

function layout(site, page, main, { current, sidebar = true } = {}) {
  return `${head(site, page)}
<body>
<a class="skip-link" href="#main">Skip to content</a>
${masthead(site, current)}
${hero(page.hero)}
<div class="container${sidebar ? '' : ' container--full'}">
  ${sidebar ? authorCard(site) : ''}
  <main id="main">
${main}
  </main>
</div>
${footer(site)}
${emailScript}
${copyScript}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Fragments

function postMeta(post, { date = true } = {}) {
  return `<p class="meta">
    ${date ? `<span>${icon('calendar')}<time datetime="${isoDate(post.date)}">${longDate(post.date)}</time></span>` : ''}
    <span>${icon('clock')}${post.readTime} minute read</span>
  </p>`;
}

function tagList(tags) {
  if (!tags.length) return '';
  const items = tags.map((t) => `<a class="tag" href="/tags/#${slugify(t)}">${esc(t)}</a>`).join('');
  return `<p class="tags">${icon('tag')}${items}</p>`;
}

const slugify = (s) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-');

function postItem(post) {
  return `<article class="entry">
  <h2 class="entry__title"><a href="${post.url}">${esc(post.title)}</a></h2>
  ${postMeta(post, { date: false })}
  ${post.excerpt ? `<p class="entry__excerpt">${esc(post.excerpt)}</p>` : ''}
</article>`;
}

function postCard(post) {
  return `<a class="card" href="${post.url}">
  ${post.teaser ? `<span class="card__img"><img src="${post.teaser}" alt="" loading="lazy"></span>` : ''}
  <span class="card__title">${esc(post.title)}</span>
  <span class="card__excerpt">${esc(post.excerpt || '')}</span>
</a>`;
}

function toc(headings) {
  const items = headings
    .filter((h) => h.level >= 2 && h.level <= 3)
    .map((h) => `<li class="toc__l${h.level}"><a href="#${h.slug}">${esc(h.title)}</a></li>`)
    .join('');
  if (!items) return '';
  return `<nav class="toc" aria-label="On this page">
  <h2 class="toc__title">${icon('list')}On this page</h2>
  <ul>${items}</ul>
</nav>`;
}

// ---------------------------------------------------------------------------
// Pages

function ageNotice(site, p) {
  const age = new Date().getUTCFullYear() - p.date.getUTCFullYear();
  if (!site.old_post_years || age < site.old_post_years) return '';
  return '<p class="age-notice">This post was handcrafted some time ago and might be out of date.</p>';
}

export function post(site, p) {
  const hasToc = p.toc && p.headings.length > 1;
  const pager = `<nav class="pager" aria-label="More posts">
    ${p.older ? `<a class="pager__prev" href="${p.older.url}"><small>Previous</small>${esc(p.older.title)}</a>` : '<span></span>'}
    ${p.newer ? `<a class="pager__next" href="${p.newer.url}"><small>Next</small>${esc(p.newer.title)}</a>` : '<span></span>'}
  </nav>`;
  const related = p.related.length
    ? `<section class="related"><h2>You may also enjoy</h2><div class="cards">${p.related.map(postCard).join('')}</div></section>`
    : '';

  return layout(site, p, `<article class="post${hasToc ? ' post--toc' : ''}">
  <header class="post__header">
    <h1 class="post__title">${esc(p.title)}</h1>
    ${postMeta(p)}
  </header>
  ${hasToc ? toc(p.headings) : ''}
  ${ageNotice(site, p)}
  <div class="prose"${p.lang ? ` lang="${esc(p.lang)}"` : ''}>
${p.content}
  </div>
  <footer class="post__footer">
    ${tagList(p.tags)}
    ${pager}
  </footer>
</article>
${related}`);
}

export function page(site, p) {
  return layout(site, p, `<article class="post">
  <header class="post__header"><h1 class="post__title">${esc(p.title)}</h1></header>
  <div class="prose">
${p.content}
  </div>
</article>`, { current: p.url, sidebar: p.author_profile !== false });
}

export function home(site, posts, pager) {
  const links = [];
  if (pager.current > 1) links.push(`<a href="${pager.url(pager.current - 1)}" rel="prev">&larr; Newer</a>`);
  for (let i = 1; i <= pager.total; i++) {
    links.push(i === pager.current
      ? `<span aria-current="page">${i}</span>`
      : `<a href="${pager.url(i)}">${i}</a>`);
  }
  if (pager.current < pager.total) links.push(`<a href="${pager.url(pager.current + 1)}" rel="next">Older &rarr;</a>`);

  const meta = {
    url: pager.url(pager.current),
    title: pager.current > 1 ? `Page ${pager.current}` : null,
    hero: site.home.hero,
  };
  return layout(site, meta, `<h1 class="section-title">${pager.current > 1 ? `Recent posts &middot; page ${pager.current}` : 'Recent posts'}</h1>
${posts.map(postItem).join('\n')}
<nav class="pagination" aria-label="Pagination">${links.join('')}</nav>`, { current: '/' });
}

export function archive(site, posts) {
  const years = new Map();
  for (const p of posts) {
    const y = p.date.getUTCFullYear();
    if (!years.has(y)) years.set(y, []);
    years.get(y).push(p);
  }
  const cfg = site.posts_page;
  const sections = [...years.entries()].map(([year, list]) => `<section class="year" id="${year}">
  <h2 class="year__title">${year}</h2>
  <div class="cards">${list.map(postCard).join('')}</div>
</section>`).join('\n');
  const jump = [...years.keys()].map((y) => `<a href="#${y}">${y}</a>`).join('');

  return layout(site, { url: '/posts/', title: cfg.title, excerpt: cfg.excerpt, hero: cfg.hero }, `<h1 class="section-title">${esc(cfg.title)}</h1>
<nav class="chips">${jump}</nav>
${sections}`, { current: '/posts/' });
}

export function tags(site, tagGroups) {
  const cfg = site.tags_page;
  const cloud = tagGroups
    .map((t) => `<a href="#${t.slug}">${esc(t.name)} <span>${t.posts.length}</span></a>`)
    .join('');
  const sections = tagGroups.map((t) => `<section class="tag-group" id="${t.slug}">
  <h2>${esc(t.name)}</h2>
  <ul class="post-list">${t.posts.map((p) => `<li><a href="${p.url}">${esc(p.title)}</a><time datetime="${isoDate(p.date)}">${isoDate(p.date)}</time></li>`).join('')}</ul>
</section>`).join('\n');

  return layout(site, { url: '/tags/', title: cfg.title, excerpt: cfg.excerpt, hero: cfg.hero }, `<h1 class="section-title">${esc(cfg.title)}</h1>
<nav class="chips">${cloud}</nav>
${sections}`, { current: '/tags/' });
}

// ---------------------------------------------------------------------------
// Feeds

export function feed(site, posts) {
  const updated = posts[0]?.date.toISOString() ?? new Date().toISOString();
  const entries = posts.map((p) => `<entry>
  <title>${esc(p.title)}</title>
  <link href="${abs(site, p.url)}" rel="alternate" type="text/html"/>
  <id>${abs(site, p.url.replace(/\.html$/, ''))}</id>
  <published>${p.date.toISOString()}</published>
  <updated>${p.date.toISOString()}</updated>
  <author><name>${esc(site.author.name)}</name></author>
  ${p.tags.map((t) => `<category term="${esc(t)}"/>`).join('')}
  <summary>${esc(p.excerpt || '')}</summary>
  <content type="html">${esc(p.content)}</content>
</entry>`).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${esc(site.title)}</title>
<subtitle>${esc(site.description)}</subtitle>
<link href="${site.url}/feed.xml" rel="self" type="application/atom+xml"/>
<link href="${site.url}/" rel="alternate" type="text/html"/>
<id>${site.url}/feed.xml</id>
<updated>${updated}</updated>
<author><name>${esc(site.author.name)}</name></author>
${entries}
</feed>
`;
}

export function sitemap(site, urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${abs(site, u.url)}</loc>${u.date ? `<lastmod>${u.date.toISOString()}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}
