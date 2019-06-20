---
title: "ModSecurity Nagios NRPE Check"
excerpt: "How to integrate modsecurity with Nagios using a custom NRPE script to audit logs and receive notifications."
header:
  teaser: /images/Mod-Security.png
  og_image: /images/Mod-Security.png
tags:
  - monitoring
  - security
  - automation
  - howto
---

![modesecurity](/images/Mod-Security.png){: .align-center}

Even with our best efforts web servers/applications security are always vulnerable to 0 day exploits, poorly written code or even a bad configuration. Introducing [ModSecurity](http://www.modsecurity.org/projects/modsecurity/), a web application firewall or layer 7 firewall (but I truly despise this denomination), it works inspecting web traffic looking for suspicions patterns and, for example, stopping a malicious attempt with a http 403 forbidden.

But even with a very impressive success rate on preventing exploits, there's still the need to audit its logs and get notifications of the evil attempts. [AuditConsole](http://www.jwall.org/web/audit/console/index.jsp) has the best auditing capabilities I've tested so far and for the notification component there's nothing like cooking a quick and dirty NRPE script:

{% highlight bash %}
 #!/bin/bash

######################
# blog.kintoandar.com
######################

# vhost(s) logs
LOGS="/vhost/logs/*log"

# 24h notification
DATE=`date |awk {'print $1" "$2" "$3'}`

# count number of criticals
COUNT=`grep CRITICAL $LOGS | grep -c "$DATE"`

# OK
if [ $COUNT -eq 0 ] ; then
  echo "0 hits found"
  exit 0 
fi

# CRITICAL
echo "$COUNT hits found"
exit 2
{% endhighlight %}

[Get it on Github](https://github.com/kintoandar/shell_scripts/blob/master/nrpe/check_modsec.sh){: .btn .btn--info}
