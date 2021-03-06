---
title: 'Home is Where the Blog is'
excerpt: "A blog workflow using github-pages and jekyll"
date: '2014-11-07'
header:
  teaser: /images/jekyll_github.png
  og_image: /images/jekyll_github.png
tags:
  - development
  - automation
---
And the day came to migrate [my old blog](http://kintoandar.blogspot.com). I know it's an usual thing to do, but I've never done it before.

My previous blog survived since 2008 on blogger and, apart of some cosmetic tinkering, it was fine for me.
Time went by and I grew tired of the WYSIWYG bugs, that always ended up with me messing around with the posts HTML.

![jekyll github](/images/jekyll_github.png)

Out with old, in with the new. The markdown approach for blogging was so appealing I couldn't resist, besides, [Jekyll](http://jekyllrb.com/) + [Github](https://github.com/kintoandar) combo was just what the doctor ordered.

Importing the old posts while preserving the URLs (so you don't loose the page rank) was dead simple, but unfortunately all of them are saved as a single line per file, so `<irony>` good luck editing them the future `</irony>`.

Have user comments on your posts and don't want to loose them? No problem, [disqus](https://disqus.com/) has you covered and the integration with Jekyll is trivial.

After finding a decent theme (thanks to [Michael Rose](https://mademistakes.com/)), it was just a matter of learning the Jekyll workflow and start typing. It's all pretty straight forward and if you already use github personal pages, publishing the new blog is just a git push away.

So, if you ever need:

* Easy migration from other platforms (ex: Blogger, Wordpress)
  * Posts
  * Comments
  * URL path
* Markdown Posts
* Quick integration with Google Analytics and Disqus
* Version control
* Fast content preview cycle (using `jekyll serve --watch`)
* Power/freedom to do whatever you want

This kind on setup is for you too!

**Heads up**, if you've subscribed to my old blog feeds, you might have to [update your reader settings](http://blog.kintoandar.com/feed.xml).
{: .notice--danger}
