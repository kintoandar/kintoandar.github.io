---
title: Server side SVN + SSH logging
excerpt: "How to ensure SVN server side is logging every user action on each repository using SSH."
header:
  teaser: /images/logs.jpg
  og_image: /images/logs.jpg
tags:
  - development
  - automation
  - linux
---

![logs](/images/logs.jpg){: .align-center}

After searching the interwebs for a method on obtaining server side logging capability on SVN over SSH with no success, I decided to do some reverse engineering on how SVN works hopping to get it logging every user action on each repository. 

What I've found is that every client SVN call to the server via SSH launches svnserve, and indeed there is a `svnserve.conf` config file on every repository, unfortunately with no log flag available. Nontheless the svnserve binary accepts the desired log flag, so let's get creative... 

{% highlight bash %}
[root@svn-server ~]# mkdir /var/log/svn/

[root@svn-server ~]# whereis svnserve
svnserve: /usr/bin/svnserve 

[root@svn-server ~]# mv /usr/bin/svnserve /usr/bin/svnserve.bin 

[root@svn-server ~]# cat /usr/bin/svnserve
/usr/bin/svnserve.bin --log-file /var/log/svn/svnserve_`id -u`.log $1 

[root@svn-server ~]# chmod +x  /usr/bin/svnserve
{% endhighlight %}

**There, you got logging!**

What some log rotating? Sure, here you go:

{% highlight bash %}
[root@svn-server ~]# cat /etc/logrotate.d/svn
/var/log/svn/svnserve*.log {
        daily
        rotate 365
        missingok
        notifempty
        lastaction
                /bin/chown root.root /var/log/svn/svnserve*.log.* > /dev/null &
                /bin/chmod 600 /var/log/svn/svnserve*.log.* > /dev/null &
        endscript
}
{% endhighlight %}
