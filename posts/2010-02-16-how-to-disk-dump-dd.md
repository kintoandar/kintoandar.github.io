---
title: "How To Disk Dump dd"
excerpt: "Tutorial on how to Disk Dump for disk disaster recovery and data forensics with examples to back-you-up."
header:
  teaser: /images/tux.png
  og_image: /images/tux.png
toc: true
toc_sticky: true
tags:
  - linux
  - howto
---

<div class="center">

![tux](/images/tux.png)

</div>

Disk Dump is nothing less than a life saviour when we're talking about disk disaster recovery or even data forensics.<br>
<br>
Here's a quick list of cool examples with the `dd` tool.

## Create a backup

```bash
dd if=/dev/sda of=/opt/backup_sda.img
```

## Restore a backup

```bash
dd if=/opt/backup_sda.img of=/dev/sda
```

## Clone a hard disk

```bash
dd if=/dev/sdb of=/dev/sdc
```

## Transfer a disk image

```bash
dd if=/dev/sdb | ssh root@target "(cat > backup.img)"
```

## Create an iso image of a CD/DVD

```bash
dd if=/dev/cdrom of=cdimage.iso
```

### Burn an iso image of a CD/DVD

```bash
dd if=cdimage.iso of=/dev/cdrom obs=32k seek=0
```

## Rescue a file that contains bad blocks

```bash
dd if=movie.avi of=rescued_movie.avi conv=noerror
```

## Create your own bootloader

```bash
dd conv=notrunc if=bootloader of=qemu.img
```

## Create a backup of your MBR

```bash
dd if=/dev/sdb of=mbr_backup bs=512 count=1
```

## Restore a backup of your MBR

```bash
dd if=mbr_backup of=/dev/sdb bs=512 count=1
```

## Mount dd image of and entire disk

You must use the start number of the partition.

```bash
fdisk -u -l disk_image
```

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

```bash
mount -o loop,offset=32901120 -t auto /mnt/storage/disk_image /mnt/image_partition_2
```

## When the hard disk has errors

Get the [dd_rescue](http://www.garloff.de/kurt/linux/ddrescue/) tool

```bash
dd_rescue /dev/sdb /opt/backup_sdb.img
```

## Network Clone

 * Destination:

```bash
nc -l -p 2222 | dd of=/dev/sda bs=16M
```

 * Source:

```bash
dd if=/dev/sda bs=16M | nc $Destination 2222
```

## Network speed test

```bash
dd if=/dev/zero bs=1M count=100 | ssh user@machine 'cat > /dev/null'
```
