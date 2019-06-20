---
title: Attack detection and notification with iptables, psad and notify-send
excerpt: "Tutorial on how to implement a personal intrusion detection system using the best open source tools available."
header:
  teaser: /images/burning-flame.jpg
  og_image: /images/burning-flame.jpg
tags:
  - linux
  - security
  - automation
  - howto
---

![flame](/images/burning-flame.jpg){: .align-center}

For some time now I've been searching for some way to integrate firewall log alerts into my desktop.

![firestarter](/images/firestarter.png){: .align-center}

A few years back (before I started to truly enjoy iptables) I was a firestarter user, I even [wrote a handy script](http://kintoandar.blogspot.com/2008/09/firestarter-firewall-switch.html) for it and really liked the notifications it provided.

![netfilter](/images/netfilter.png){: .align-center}

Nowadays I crave for iptables scripts and can't stand firestarter interface, this became a problem. How could I have an elegant way of being notified of potential threats without depending on email alerts or log watching?

Using [conky seemed a cool alternative](http://kintoandar.blogspot.com/2010/12/conky-config-eee-netbook.html) and its scripting capabilities were indeed a solution for my problem. But soon realized I always keep windows maximized and didn't notice conky on the background, alerts were ignore and the idea buried. Yesterday, as I watched a pop-up notification on my screen another idea just poped (pun intended).

There should be a way to easily parse iptables logs matching them with known attack signatures, and guess what?... There is, it's called psad, and you probably remember [me talking about it a few posts ago](http://kintoandar.blogspot.com/2010/02/book-review-linux-firewalls.html). Using psad to parse the log files you can be notified of network attacks in real time, the end of the tiresome log surfing after the attack already taken place.

The only thing we're missing is the notification, well, that was easier than I thought because psad can execute a script every time an attack is detected. Keeping this in mind, and using notify-send capabilities, we can have a visual notification spawned by psad upon an attack detection.

Here follows the configurations I've used to turn the idea into reality.
(I've tested it on xubuntu, but this would be identical on other distros)

First the software requirements:

{% highlight bash %}
apt-get install iptables-persistent
apt-get install libnotify-bin
apt-get install psad
{% endhighlight %}

For the iptables configuration you may use [my template](https://github.com/kintoandar/shell_scripts/blob/master/automation/iptables.sh) and tailor it to you likings.

Edit the psad configuration file `/etc/psad/psad.conf` and change the following variables accordingly, I'll explain each one of them.
Change USERNAME with your system username.

{% highlight bash %}
# This variable is just for future reference, because we want visual notifications, not email
EMAIL_ADDRESSES USERNAME@machine.lan;

# Here we disable the email notifications
ALERTING_METHODS noemail;

# Point the following variable to the correct log file (redhat based systems should be /var/log/messages)
IPT_SYSLOG_FILE /var/log/syslog;
### Enable psad to run an external script or program (use at your
### own risk!)
ENABLE_EXT_SCRIPT_EXEC Y;
# DISPLAY and XAUTHORITY are used to define the where and how to connect to the user desktop
# The nofify-send flags:
# -t tells to keep the notification visible until closed by the user
# -i path to an image that will be displayed on the notification
# -c what is the type of the notification
# Then follows the title and the body of the notification, SRCIP is a psad internal variable that hold the source IP of the attacker
EXTERNAL_SCRIPT DISPLAY=:0.0 XAUTHORITY=/home/USERNAME/.Xauthority notify-send -t 0 -i /usr/share/icons/Tango/scalable/emblems/emblem-important.svg -c network "Firewall Alert" "Intrusion detected from SRCIP";

# You want to always be notified each time an attack is detected, even if it is from the same source
EXEC_EXT_SCRIPT_PER_ALERT Y;
{% endhighlight %}


All done, save the file.

Deploy your iptables rules policy, restart psad daemon, go to another machine on the network and run nmap against your host, for example a simple syn scan without pinging:

{% highlight bash %}
nmap -P0 -sS 192.168.1.66
{% endhighlight %}

You should now be presented with something like this on your host:

![notify](/images/notify-send.png){: .align-center}

Special thanks to Michael Rash for psad and the one of my favorite books [Attack Detection and Response with iptables, psad, and fwsnort](Attack Detection and Response with iptables, psad, and fwsnort).
{: .notice--info}
