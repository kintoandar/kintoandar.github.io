---
created: 2019-06-20
updated: 2026-11-19
---
# kintoandar

Source for **[blog.kintoandar.com](https://blog.kintoandar.com)**.

## Layout

| Path        | What                                                         |
|-------------|--------------------------------------------------------------|
| `posts/`    | Blog posts, named `YYYY-MM-DD-slug.md`                       |
| `pages/`    | Standalone pages (about, publications, 404)                  |
| `static/`   | Copied as-is to the site root (images, favicon, CNAME, ...)  |
| `theme/`    | HTML templates (`templates.mjs`), `style.css`, card fonts    |
| `lib/`      | Image optimisation and social card generation                |
| `site.yml`  | Site settings: title, author, navigation, analytics, paging  |
| `build.mjs` | The generator                                                |
| `nginx/`    | Example nginx config for self-hosting                        |

## Usage

```sh
npm install
npm run serve   # http://localhost:4000, rebuilds on change
npm run build   # writes the site to _site/
```

Every push to `master` (a merged PR) runs `.github/workflows/deploy.yml`, which builds the site once,
deploys it to GitHub Pages and publishes the same build as a zip on a GitHub release
(tagged `vYYYY.MM.DD-<run>`, with the zip's sha256 in the release notes).

At build time every local image gets width/height, lazy loading and a WebP version (via `<picture>`),
and each post gets a social preview card at `/og/YYYY/MM/slug.png`. Both are cached in `.cache/`.

## Serving on a web server

`_site/` is plain static files, so any web server works. Posts are files (`/2018/01/slug.html`)
and pages are folders with an `index.html` (`/posts/`, `/page2/`), so the server only needs to
serve `index.html` for directories and `404.html` for missing pages.

With nginx, use [`nginx/blog.conf`](nginx/blog.conf) (adjust `server_name` and `root`):

```sh
npm ci && npm run build
rsync -av --delete _site/ user@server:/var/www/blog/
scp nginx/blog.conf user@server:/tmp/ && ssh user@server \
  'sudo mv /tmp/blog.conf /etc/nginx/conf.d/ && sudo nginx -t && sudo systemctl reload nginx'
```

For HTTPS, put it behind Cloudflare or add a certificate with `certbot --nginx -d blog.kintoandar.com`.

To try it locally with Docker:

```sh
docker run --rm -p 8080:80 \
  -v "$PWD/_site:/var/www/blog:ro" \
  -v "$PWD/nginx/blog.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx
# http://localhost:8080
```

## Writing a post

Create `posts/YYYY-MM-DD-my-post.md`; it will be served at `/YYYY/MM/my-post.html`.

```markdown
---
title: "My post"
excerpt: "One line summary used on listings and social cards"
header:
  teaser: /images/my-post.png   # card image on /posts/ and related posts
  og_image: /images/my-post.png # social preview (falls back to teaser)
toc: true                       # optional table of contents
lang: pt                        # optional, for posts not written in English
tags:
  - linux
---

Regular Markdown. Fenced code blocks get syntax highlighting.

![logo](/images/logo.png){.align-center}

[A button](https://example.com){.btn .btn--info}

Heads up, this is a note.
{.notice--info}
```

Classes can be attached with `{.class}` ([markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)).
Useful ones: `align-center`, `align-left`, `align-right`, `btn`, `btn--info`, `notice--info`, `notice--danger`.
For an image gallery use `<figure class="gallery gallery--2">` with `<img>`s inside (`gallery--3` for three columns).
