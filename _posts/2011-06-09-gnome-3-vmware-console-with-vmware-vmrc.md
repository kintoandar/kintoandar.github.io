---
title: "Gnome 3 vmware-console with vmware-vmrc fix"
excerpt: "How to fix vmware-console in Gnome 3 so it won’t die on you anymore  for no apparent reason."
header:
  teaser: /images/vmware-logo.jpg
  og_image: /images/vmware-logo.jpg
tags:
  - linux
  - howto
---

![vmware](/images/vmware-logo.jpg){: .align-center}

Well, just upgraded my eee to fedora 15 and I have to say it's awesome! Much faster than the older version, I personally recommend you to make the jump.

But like always there were some problems, one of them was the hibernate feature ceasing to work, the other one was vmware console plugin just dying with no apparent reason and no log whatsoever (yes, I still use vmware server, my server processor does not comply with KVM virtualization...).

After a lot of google digging I've was able to find a quick and dirty fix, here is how it's done:

First of all create a folder named vmware-console and move yourself into it:

{% highlight bash %}
mkdir vmware-console 
cd vmware-console
{% endhighlight %}

Get from your vmware server the .xpi package with the console plugin:

{% highlight bash %}
wget --no-check-certificate  https://vmwareserver:8333/ui/plugin/vmware-vmrc-linux-x86.xpi
{% endhighlight %}

Or for the 64bit version: 

{% highlight bash %}
wget --no-check-certificate  https://vmwareserver:8333/ui/plugin/vmware-vmrc-linux-x64.xpi
{% endhighlight %}

Unzip the file:

{% highlight bash %}
unzip vmware-vmrc-linux-x86.xpi
{% endhighlight %}

Create a new file like this:

{% highlight bash %}
sudo gedit /usr/bin/vmware-vmrc
{% endhighlight %}

Paste the following magic code, and don't forget to change the `$PATH_TO_VMRC` variable so it points to the folder plugins you've extracted earlier:

{% highlight bash %}
#!/bin/bash

# Please define this variable with the path to the plugins folder
PATH_TO_VMRC="/home/user/vmware-console/plugins"

export VMWARE_USE_SHIPPED_GTK=yes
cd $PATH_TO_VMRC
./vmware-vmrc > /dev/null 2>&1 &
cd - > /dev/null 2>&1
{% endhighlight %}

Save and close the file and then change it to be executable:

{% highlight bash %}
sudo chmod +x /usr/bin/vmware-vmrc
{% endhighlight %}

Now try typing on the terminal

{% highlight bash %}
vmware-vmrc
{% endhighlight %}

Problem solved, you've vmware console back in business!

[Get it from GitHub](https://github.com/kintoandar/shell_scripts/blob/master/automation/vmware-vmrc.sh){: .btn .btn--info}
