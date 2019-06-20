---
title: "Live USB system rescue cd"
excerpt: "Tutorial on how to create a dual partition liveUSB system rescue pen drive, a tool that every sysadmin should always have on their pockets."
header:
  teaser: /images/tux.png
  og_image: /images/tux.png
tags:
  - linux
  - automation
  - howto
---

Here's a fool prof tutorial on how to create a dual partition liveusb system rescue pen drive:

(pen drive == /dev/sdb)
{: .notice--danger}

{% highlight bash %}
sudo fdisk /dev/sdb

* n to create a new partition
* p to make it primary
* 1 so it is the first primary partition
* Accept the default or type 1 to start from the first cylinder
* +200M to make it 200 Meg big
* a to toggle the partition active for boot
* 1 to choose the 1 partition
* t to change the partition type
* 6 to set it to FAT16
{% endhighlight %}

Now we have out first partition set up, let's create the second one:

{% highlight bash %}
* n to create yet again a new partition
* p to make it primary
* 2 to be the second partition
* Accept the default by typing Enter
* Accept the default to make your partition as big as possible
* Finally, type w to write the change to your usb pendrive

sudo mkfs.vfat -F 16 -n boot /dev/sdb1
sudo mkfs.vfat -F 32 -n usb_drive /dev/sdb2
{% endhighlight %}

(You can get the systemrescuecd here)

{% highlight bash %}
mount -oloop /opt/iso/systemrescuecd-*.iso /media/iso/

cp -af /media/iso/* /media/boot/
rm -rf /media/boot/syslinux
mv /media/boot/isolinux/isolinux.cfg /media/boot/isolinux/syslinux.cfg
sed -i -e 's/scandelay=1/scandelay=5/g' /media/boot/isolinux/syslinux.cfg
mv /media/boot/isolinux /media/boot/syslinux
{% endhighlight %}

{% highlight bash %}
umount /media/boot
syslinux /dev/sdb1
sync
{% endhighlight %}
