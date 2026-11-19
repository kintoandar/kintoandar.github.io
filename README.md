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
| `site.yml`  | Site settings: title, author, navigation, Disqus, pagination |
| `build.mjs` | The generator                                                |

## Usage

```sh
npm install
npm run serve   # http://localhost:4000, rebuilds on change
npm run build   # writes the site to _site/
```

Pushing to `master` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

At build time every local image gets width/height, lazy loading and a WebP version (via `<picture>`),
and each post gets a social preview card at `/og/YYYY/MM/slug.png`. Both are cached in `.cache/`.

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
