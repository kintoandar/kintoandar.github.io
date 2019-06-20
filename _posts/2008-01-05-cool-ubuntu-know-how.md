---
title: "Cool Ubuntu know how"
excerpt: "The difference between Red Hat’s and Ubuntu’s configuration utility and how to fix sound issues in Quake III Arena and Pidgin running on Ubuntu."
header:
  teaser: /images/ubuntu.png
  og_image: /images/ubuntu.png
tags:
  - linux
  - howto
---

![Ubuntu](/images/ubntu.png){: .align-center}

One interesting thing is that in Red Hat based distributions the "run levels" configuration utility is **chkconfig** but in Ubuntu (Debian) the utility is **sysv-rc-conf**.

## Quake III Arena
If you have mute sound problems in **Quake III Arena**, try using these commands as root, this one before playing the game:

{% highlight bash %}
echo "quake3.x86 0 0 direct" > /proc/asound/card0/pcm0p/oss
{% endhighlight %}

After exiting the game: 

{% highlight bash %}
echo "quake3.x86 0 0 disable" > /proc/asound/card0/pcm0c/oss
{% endhighlight %}

## Pidgin
Sound issues with **Pidgin**? In the [ Preferences > Sounds > Method ] choose *command* and write on the *Sound command* text box:

{% highlight bash %}
aplay %s
{% endhighlight %}

That's it, try it now!
