---
layout: post
title: How To Disk Dump dd
date: '2010-02-16T14:34:00.009Z'
author: Joel Bastos
excerpt: "How to Disk Dump with simple examples"
tags:
modified_time: '2013-06-05T12:56:35.111+01:00'
image:
  thumb: tux.png
blogger_id: tag:blogger.com,1999:blog-1780138848439428569.post-7078963697193590739
blogger_orig_url: http://blog.kintoandar.com/2010/02/how-to-disk-dump-dd.html
comments: true
---
<section id="table-of-contents" class="toc">
  <header>
    <h3>Index</h3>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

<div style="text-align:center" markdown="1">
![tux](/images/tux.png)
</div>

Disk Dump is nothing less than a life saviour when we're talking about disk disaster recovery or even data forensics.<br>
<br>
Here's a quick list of cool examples with the `dd` tool.

#### Create a backup

{% highlight bash %}
dd if=/dev/sda of=/opt/backup_sda.img
{% endhighlight %}

#### Restore a backup

{% highlight bash %}
dd if=/opt/backup_sda.img of=/dev/sda
{% endhighlight %}

#### Clone a hard disk

{% highlight bash %}
dd if=/dev/sdb of=/dev/sdc
{% endhighlight %}

#### Transfer a disk image

{% highlight bash %}
dd if=/dev/sdb | ssh root@target "(cat > backup.img)"
{% endhighlight %}

#### Create an iso image of a CD/DVD

{% highlight bash %}
dd if=/dev/cdrom of=cdimage.iso
{% endhighlight %}

#### Burn an iso image of a CD/DVD

{% highlight bash %}
dd if=cdimage.iso of=/dev/cdrom obs=32k seek=0
{% endhighlight %}

#### Rescue a file that contains bad blocks

{% highlight bash %}
dd if=movie.avi of=rescued_movie.avi conv=noerror
{% endhighlight %}

#### Create your own bootloader

{% highlight bash %}
dd conv=notrunc if=bootloader of=qemu.img
{% endhighlight %}

#### Create a backup of your MBR

{% highlight bash %}
dd if=/dev/sdb of=mbr_backup bs=512 count=1
{% endhighlight %}

#### Restore a backup of your MBR

{% highlight bash %}
dd if=mbr_backup of=/dev/sdb bs=512 count=1
{% endhighlight %}

#### Mount dd image of and entire disk

You must use the start number of the partition.

{% highlight bash %}
fdisk -u -l disk_image
{% endhighlight %}

```
Disk /mnt/storage/disk_image: 0 MB, 0 bytes255 heads, 63 sectors/track, 0 cylinders, total 0 sectors
Units = sectors of 1 * 512 = 512 bytesDisk identifier: 0x41172ba5

Device                      Boot    Start    End       Blocks   Id  System
/mnt/storage/disk_image1            63       64259     32098+   de  Dell Utility
/mnt/storage/disk_image2    *       64260    78108029  39021885 7   HPFS/NTFS

Partition 2 has different physical/logical endings:phys=(1023, 254, 63) logical=(4861, 254, 63)
```

Then take the start of the partition that you want to edit, `64260` (disk_image2) in this case, and multiply it by `512`<br>
<br>
Ex: `512 * 64260 = 32901120`

{% highlight bash %}
mount -o loop,offset=32901120 -t auto /mnt/storage/disk_image /mnt/image_partition_2
{% endhighlight %}

#### When the hard disk has errors

Get the [dd_rescue](http://www.garloff.de/kurt/linux/ddrescue/) tool

{% highlight bash %}
dd_rescue /dev/sdb /opt/backup_sdb.img
{% endhighlight %}

#### Network Clone

 * Destination:

{% highlight bash %}
nc -l -p 2222 | dd of=/dev/sda bs=16M
{% endhighlight %}

 * Source:

{% highlight bash %}
dd if=/dev/sda bs=16M | nc $Destination 2222
{% endhighlight %}

#### Network speed test

{% highlight bash %}
dd if=/dev/zero bs=1M count=100 | ssh user@machine 'cat > /dev/null'
{% endhighlight %}
