---
title: Asus eee 1001p Ubuntu How-To
excerpt: "Tutorial on how to install and configure Ubuntu 10.04 on Asus eee 1001p, so the hardware works properly."
header:
  teaser: /images/ubuntu.png
  og_image: /images/ubuntu.png
toc: true
toc_sticky: true
tags:
  - howto
  - linux
---

![ubuntu](/images/ubuntu.png){: .align-center}

I've finally given in to temptation and bought a netbook. After allot of searching I've chosen an Asus eee 1001p.

Then come the decision of a suitable OS, almost went with Fedora but the final choice was Ubuntu 10.04.

This post is all about the installation and configuration of the OS and all the tinkering I've had to do to get all (or most) the hardware to work properly.

## Wifi Controller

{% highlight bash %}
lspci |grep Network
02:00.0 Network controller: Atheros Communications Inc. Device 002c (rev 01)

wget http://linuxwireless.org/download/compat-wireless-2.6/compat-wireless-2.6.tar.bz2
tar xvfj compat-wireless-2.6.tar.bz2
cd compat-wireless-*
./scripts/driver-select ath9k
make
make install
make unload
make wlunload
make btunload
modprobe ath9k
{% endhighlight %}

## Screen Brightness
To solve the wired brightness bug edit:

{% highlight bash %}
vi /etc/default/grub
{% endhighlight %}

and change the `GRUB_CMDLINE_LINUX_DEFAULT` variable adding the following flags:

{% highlight bash %}
GRUB_CMDLINE_LINUX_DEFAULT="acpi_osi=Linux acpi_backlight=vendor"
{% endhighlight %}

Finally update grub configuration and you're done:

{% highlight bash %}
update-grub2
{% endhighlight %}

## Multi-Touch Configuration
Create a script with your user named `multi-touch.sh` and add the following:

{% highlight bash %}
#!/bin/sh
#
# Synaptics TouchPad 2 finger Scrolling
#

# Set multi-touch emulation parameters
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Synaptics Two-Finger Pressure" 32 8
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Synaptics Two-Finger Width" 32 8
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Two-Finger Scrolling" 8 1
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Synaptics Two-Finger Scrolling" 8 1 1

# Disable edge scrolling
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Synaptics Edge Scrolling" 8 0 0 0

# This will make cursor not to jump if you have two fingers on the touchpad and you list one
# (which you usually do after two-finger scrolling)
xinput set-int-prop "SynPS/2 Synaptics TouchPad" "Synaptics Jumpy Cursor Threshold" 32 110
{% endhighlight %}

Add a line to your `~/.bashrc` with:

{% highlight bash %}
source /path-to/multi-touch.sh
{% endhighlight %}
