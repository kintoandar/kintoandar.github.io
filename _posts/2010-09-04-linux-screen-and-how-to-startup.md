---
title: Linux screen multiple applications startup
excerpt: "Tutorial on how to get the most out of Screen, enabling screen sessions automatically on boot."
header:
  teaser: /images/screen_session.png
  og_image: /images/screen_session.png
gallery:
  - url: /images/screen_session.png
    image_path: /images/screen_session.png
    alt: "screen_session"
toc: true
toc_sticky: true
tags:
  - automation
  - linux
  - howto
---

[Screen](http://www.gnu.org/software/screen/) is one of the most helpful applications you'll ever use.

This post will show the configuration I personally use and how to startup multiple applications on boot.

Here's how my config looks like running irssi:

{% include gallery caption="Screen screenshot (pun intended)" %}

## Configuration
The configuration being used:

{% highlight bash %}
user@gambit:~$ cat ~/.screenrc
{% endhighlight %}

{% highlight bash %}
nethack on
defscrollback 10000
hardstatus on
hardstatus alwayslastline
hardstatus string '%{= kG}[ %{G}%H %{g}][%= %{= kw}%?%-Lw%?%{r}(%{W}%n*%f%t%?(%u)%?%{r})%{w}%?%+Lw%?%?%= %{g}][%{B} %m/%d %{W}%c %{g}]'
startup_message off
vbell on

# The applications you want running when screen starts
screen -t DOWNLOADS 0 rtorrent
screen -t IRC 1 irssi
{% endhighlight %}

## Startup
After configuring your own `.screenrc` just add on `/etc/rc.local` the following:

{% highlight bash %}
su user -c "screen -d -m -S SomeCoolName"
{% endhighlight %}

All done, next time there is a system reboot, screen will start with two applications running in the chosen _user_ space.
