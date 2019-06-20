---
title: "Tools of the trade"
excerpt: "A list of the best tools I’m currently using for coding and improving productive workflows."
header:
  teaser: /images/Brain-Gears.png
  og_image: /images/Brain-Gears.png
toc: true
toc_sticky: true
tags:
  - development
  - linux
---

![devops](/images/Brain-Gears.png){: .align-center}

A few months after joining the Jedi order of Linux Application Engineers, much has changed on the way I get stuff done. For starters, I'm finally able to work with a fully fledged software pipeline for continuous integration (soon to be s/integration/delivery/). Automation is of the essence and the devops mentality is a fundamental cornerstone for my team (how cool is that?). 

Well, with all these changes it's obvious I was bound to pick up some tech tips along the way and I'll share the tools I've grown to be addicted to. 

You probably spend a lot of time on a text editor, be sure to choose your poison wisely and learn to use it to it's full potential, [shortcutfoo.com](https://www.shortcutfoo.com/) is a great way of training your muscle memory on the key bindings of the most famous editors and have fun while you're learning, be sure to give it a try.

## Vim related tools
Vim is my editor of choice and here are the plugins I'm using so far.

![Vim_logo](/images/Vim_logo.png){: .align-center}

[solarized](http://ethanschoonover.com/solarized) - A color scheme for VIM and bash, it looks really sleek and the best way to spare your eyes.

[nerdtree](https://github.com/scrooloose/nerdtree) - Ever missed a filesystem navigator inside VIM? There you go... 

![nerdtree](/images/nerdtree.png){: .align-center}

[powerline](https://github.com/Lokaltog/powerline) - An amazing status bar with git integration, color notifications and bunch of other cool stuff.

![powerline](/images/powerline.png){: .align-center}

[syntastic](https://github.com/scrooloose/syntastic) - Ever had to exit the editor just to perform a mere syntax check on your code? Well, with syntastic those days are over. I'm currently using it with json, xml, yaml, ruby and python, probably my favorite plugin of the bunch.

![syntastic](/images/syntastic.png){: .align-center}

I've also created a couple of [key bindings](https://github.com/kintoandar/dotfiles/blob/master/.vimrc) that might interest you, like toggling paste mode, line numbers, force a sudo write or enable a hex editor, you can check them out on my [GitHub](https://github.com/kintoandar/dotfiles).

Another tool of the trade is the shell, yeah, I know all about the zsh and have a few fanboys friends who constantly talk about how awesome it is, but as I spend most of the time connected on multiple boxes I rather use a universally available one, so, bash it is.

## Miscellaneous tools
Here are couple of must have commands/scripts/apps.

[git-prompt.sh](https://github.com/git/git/blob/master/contrib/completion/git-prompt.sh) - Great way to have a visual notification on the terminal about the state of a git repo.


![git-prompt](/images/git-prompt.png){: .align-center}


[cdargs](http://www.skamphausen.de/cgi-bin/ska/CDargs) - Imagine managing paths as bookmarks, this little piece of software will save you a ton of keystrokes!

[ag](https://github.com/ggreer/the_silver_searcher) - grep is cool, but when you find yourself grepping recursively on a huge code repository it takes way too much time, ag does the same in just a fraction, it's like magic! 

[parcellite](http://parcellite.sourceforge.net/) - A pretty straightforward clipboard manager, keep an easily accessible history of your copied text.


These are the tools that help me every day. Be sure to give them a try, you won't regret it. 

And remember, the tools don't define the professional, but they sure help!

Special thanks to [@miguelcnf](https://twitter.com/miguelcnf), [@dj_jorjinho](https://twitter.com/dj_jorjinho) and [@jeffknupp](https://twitter.com/jeffknupp) for some of the tips.
{: .notice--info}
