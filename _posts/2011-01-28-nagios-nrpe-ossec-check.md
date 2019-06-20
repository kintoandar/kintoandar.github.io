---
title: Nagios NRPE OSSEC check
excerpt: "How to integrate OSSEC with Nagios using NRPE to keep an alerting eye on all your infrastructure."
header:
  teaser: /images/check_ossec.png
  og_image: /images/check_ossec.png
gallery:
  - url: /images/check_ossec.png
    image_path: /images/check_ossec.png
    alt: "nagios"
tags:
  - howto
  - security
  - monitoring
---

For some time now I've been testing [OSSEC](http://www.ossec.net/) on my own infrastucture, so far it's one of the best [IDS](http://en.wikipedia.org/wiki/Intrusion_detection_system) software I've implemented. Unfortunately the only method of alerting it has is via mail, being an hardcore [Nagios](http://www.nagios.org/) fanatic I've been searching for a way to integrate OSSEC alerts on it.
None of the solutions I've encountered on the web sufficed, so nothing better than creating my own and sharing it with you.
Well, with little personal time to spare I decided that It would be something quick and dirty, so nothing like a log parser to get the job done.

The idea is pretty simple, ossec-server has an alert.log file that gathers all the events of its agents, each event has an alert level associated with it and the log file is rotated each day.
In my case I just needed to search the log for an alert level equal or higher than 7 (ex: ' integrity checksum changed', 'user missed the password more than one time', etc...) and pass the information to nagios-server in a formatted string like `HOST ALERT_LEVEL CAUSE`.

Using [NRPE](https://exchange.nagios.org/directory/Addons/Monitoring-Agents/NRPE--2D-Nagios-Remote-Plugin-Executor/details) daemon to call the script and ensuring that the message reaches nagios-server, all pieces were in place and my problem solved, here's how it looks on Nagios:

{% include gallery caption="Nagios web interface" %}

{% highlight bash %}
[root@banshee ~]$ cat /etc/scripts/check_ossec.pl
{% endhighlight %}

{% highlight bash %}
#!/usr/bin/perl

######################
# blog.kintoandar.com
######################

use strict;
use warnings;

#--------------------------- Variables ------------------------------
# Where is the ossec alert.log?
# (nagios must belong to ossec /etc/group so it can open the log)
my $alert_log="/opt/ossec/logs/alerts/alerts.log";

# What level is critical for you?
my $critical="7";

# What is the OSSEC-Server name?
my $ossec="banshee";

#---------------------------- Parser --------------------------------
my @text=`grep "(level" -B 1 $alert_log`;
my $size=@text;
my @level="";
my $msg="";
my @host="";
my $count=0;
my $num=0;
for ($count=0;$count<$size;$count++){ 
    if ($text[$count] =~ m/level/){
        @level="";
        @level=split(/\(level /, $text[$count]);
        @level=split(/\) ->/, $level[1]);
        if ($level[0] >= $critical){
             chomp ($level[1]);
             if ($text[$count-1] !~ m/$ossec/){
                @host=$text[$count-1];
                @host=split(/ \(/, $host[0]);
                @host=split(/\) /, $host[1]);
                $host[0]=uc ($host[0]);
            }else{
                $host[0]=uc ($ossec);
            }
            $num++;
            $msg=$msg."[$host[0] level=$level[0]$level[1]]";
        }
    }
}

#-------------------------- Send to Nagios ---------------------------
if ($msg eq ""){
    print "No security threats found";
    exit 0;
}else{
    print "$num alerts found: $msg";
    exit 2;
}
{% endhighlight %}

[Get it on GitHub](https://github.com/kintoandar/shell_scripts/blob/master/nrpe/check_ossec.pl){: .btn .btn--info}
