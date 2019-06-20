---
title: "How to enable VDPAU XBMC 1080p Linux"
excerpt: "Learn how to get your HTPC decompressing 1080p movies directly on the GPU for a seamless Full HD movie playback experience."
header:
  teaser: /images/alternate_5_logo.png
  og_image: /images/alternate_5_logo.png
tags:
  - linux
  - howto
---

![XBMC](/images/alternate_5_logo.png){: .align-center}

After some time tinkering and compiling several XBMC binaries, I've finally got my HTPC decompressing 1080p movies (mkv x264) directly on the GPU. What does this means?

Well, without GPU decompression my processor got 100% on one core 60% on the other (multithread enabled XBMC). This meant sluggish movie play and audio delay, awful experience that prohibits Full HD movie playback. 
Using the VDPAU support on XBMC all the work of decompressing the movie goes to the graphics card and you'll have a 10% CPU usage average (sum of both cores). 

The stable XBMC from the Ubuntu repositories (apt-get install xbmc) isn't VDPAU enable so you have to cook your own XBMC version.
The following how-to is designed to prevent breaking an previous installation of XBMC. As you can see on the `--prefix=/opt/install/xbmc/` this will not interfere with other XBMC installations.

Please look at the following links to gather more information:

[VDPAU Info](http://http.download.nvidia.com/XFree86/vdpau/doxygen/html/index.html){: .btn .btn--info}
[Capable Cards](http://en.wikipedia.org/wiki/VDPAU){: .btn .btn--info}

## My Software/Hardware Specs

| Distro | Ubuntu 8.04.3 LTS |
| Kernel | 2.6.24-24-generic |
| Driver | [Nvidia Driver Used](ftp://download.nvidia.com/XFree86/Linux-x86/185.19/NVIDIA-Linux-x86-185.19-pkg1.run) |
| Graphics | MSI Geforce 9400GT 512Mb |
| CPU | Intel Pentium Dual CPU E2160 @ 1.80GHz |
| Memory | 2 x 1Gb DDR2 - 667 Mhz |

## Instructions

The following instructions must be run as root:

{% highlight bash %}
sudo su -
apt-get install subversion make g++ gcc gawk pmount libtool nasm automake cmake gperf unzip bison libsdl-dev libsdl-image1.2-dev libsdl-gfx1.2-dev libsdl-mixer1.2-dev libsdl-sound1.2-dev libfribidi-dev liblzo2-dev libfreetype6-dev libsqlite3-dev libogg-dev libasound-dev python-sqlite libglew-dev libcurl4-gnutls-dev x11proto-xinerama-dev libxinerama-dev libxrandr-dev libxrender-dev libmad0-dev libogg-dev libvorbis-dev libsmbclient-dev libmysqlclient15-dev libpcre3-dev libdbus-1-dev libhal-dev libhal-storage-dev libjasper-dev libfontconfig-dev libbz2-dev libboost-dev libfaac-dev libenca-dev libxt-dev libxtst-dev libxmu-dev libpng12-dev libjpeg-dev libpulse-dev mesa-utils libcdio-dev libsamplerate-dev libmms-dev

cd /root
wget ["http://launchpad.net/libmms/trunk/0.4/+download/libmms-0.4.tar.gz"](http://launchpad.net/libmms/trunk/0.4/+download/libmms-0.4.tar.gz)
tar -zxvf libmms-0.4.tar.gz
cd libmms-0.4
./configure --prefix=/usr
make
make install
{% endhighlight %}

No root privileges needed for the following (but they can be used nonetheless):

{% highlight bash %}
mkdir /opt/install/xbmc -p
cd /opt/install/xbmc
svn checkout [https://xbmc.svn.sourceforge.net/svnroot/xbmc/branches/linuxport/XBMC](https://xbmc.svn.sourceforge.net/svnroot/xbmc/branches/linuxport/XBMC)
cd XBMC
./configure --enable-vdpau --prefix=/opt/install/xbmc/
make
make install

# If all went without problems:

rm -rf /opt/install/xbmc/XBMC
{% endhighlight %}

You can now run as your user:

{% highlight bash %}
/opt/install/xbmc/bin/xbmc
{% endhighlight %}

On XBMC go to:

{% highlight bash %}
Settings > Video > Player > Render
{% endhighlight %}

And choose:

{% highlight bash %}
VDPAU
{% endhighlight %}

----

Give it a try and have fun ;)
