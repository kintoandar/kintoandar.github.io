---
title: "Android remote filesystem with sshfs"
excerpt: "Tutorial on how to mount a remote Android phone filesystem as a local mountpoint on your laptop."
header:
  teaser: /images/android_tux.jpg
  og_image: /images/android_tux.jpg
tags:
  - linux
  - howto
---

Well, now that I'm a proud Samsung Galaxy Ace owner and just entered the amazing world of Android, let the hacking begin!

For my first post on Android I'll explain how to mount the SDcard through a ssh filesystem on your laptop using wifi.

![android_tux](/images/android_tux.jpg){: .align-center}

The requirements are pretty strait forward, an Android device (no root necessary) with [sshdroid](http://www.appbrain.com/app/sshdroid/berserker.android.apps.sshdroid) installed, a laptop with [sshfs](http://fuse.sourceforge.net/sshfs.html) and both connected using wireless.

After starting sshdroid it will present you the IP and port of the ssh server:

![sshdroid](/images/sshdroid.jpg){: .align-center}

You may connect to your device using the laptop with the provided information:

{% highlight bash %}
ssh root@10.0.2.15 -p 2222
{% endhighlight %}

The default password is "admin", I use ssh keys instead as you should too, but I'll not cover that unless someone asks
{: .notice--danger}

Now you're inside Android, you may list the partition table, just to check, by using:

{% highlight bash %}
df
{% endhighlight %}

My SDcard is mounted on `/mnt/sdcard`, this will be useful.
You may exit Android ssh connection by typing:

{% highlight bash %}
exit
{% endhighlight %}

On the laptop make a directory to mount the Android SDcard:

{% highlight bash %}
mkdir /media/android
{% endhighlight %}

and run sshfs mounting the Android SDcard partition (`/mnt/sdcard`) on the newly created directory (`/media/android`)

{% highlight bash %}
sshfs root@10.0.2.15:/mnt/sdcard /media/android -p 2222
{% endhighlight %}

As before it will ask a password, the default password is "admin"
{: .notice--danger}

Leave that shell *as is* and open another one. Type the following on the new shell:

{% highlight bash %}
ls -la /media/android
{% endhighlight %}

As you can see you have now access to the SDcard locally with read/write permissions.

When you're done, just unmount the ssh filesystem using:

{% highlight bash %}
sudo umount /media/android
{% endhighlight %}


