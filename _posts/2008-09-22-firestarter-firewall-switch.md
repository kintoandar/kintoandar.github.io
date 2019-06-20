---
title: "Firestarter Firewall Switch"
excerpt: "This script allows you to automatically change the running network interfaces on the firewall, which comes in handy if you’re using Firestarter."
header:
  teaser: /images/ubuntu.png
  og_image: /images/ubuntu.png
tags:
  - howto
  - linux
  - security
---

If you use [Firestarter](http://www.fs-security.com/) you know the huge bummer that is restarting your settings upon a change of the working interface.
Here's a little script I've made to automatically change the running network interfaces on the firewall. Enjoy ;)

**Note:** My interfaces are eth0 and wlan0, make the correct modifications to comply with your requirements.
{: .notice--info}

{% highlight bash %}
#!/bin/sh

while true; do
INTERFACE=0

ifconfig eth0 |grep -q "inet addr"
if [ $? = 0 ];
then
sed -i 's/wlan0/\eth0/' /etc/firestarter/configuration
else
sed -i 's/eth0/\wlan0/' /etc/firestarter/configuration
INTERFACE=1
fi

iptables -L |grep -q DROP
if [ $? != 0 ];
then firestarter -s > /dev/null
if [ $INTERFACE = 0 ];
then
echo "$(date) -- firestarter running on eth0" >> /var/log/messages
else
echo "$(date) -- firestarter running on wlan0" >> /var/log/messages
fi
fi

sleep 5

done
{% endhighlight %}
