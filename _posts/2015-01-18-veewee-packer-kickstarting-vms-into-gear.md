---
layout: post
title: "Veewee, Packer and Kickstarting VMs Into Gear"
excerpt: "In a world where the Operating System installation is almost a thing of the past, with all the hosting providers giving you base boxes to use, some of us still have the privilege to tackle this task."
author: Joel Bastos
modified: 2015-01-18
tags:
comments: true
image:
  thumb: automation_cloud.jpg
---

In a world where the Operating System (OS) installation is almost a thing of the past, with all the hosting providers giving you base boxes to use,
some of us still have the privilege to tackle this task.

<div style="text-align:center" markdown="1">
![automation_cloud](/images/automation_cloud.jpg)
</div>

Don't get me wrong, OS installation **is not** a lost art and it's vital as the underlying corner stone of an infrastructure.

> How would you guarantee important OS security/service upgrade in production will play nice with your application?

> How would you be certain the development environment Virtual Machines (VMs) are a match to the production ones?

These questions are easily answered when using the OS as an artefact of the delivery pipeline, just like the application running on it.
\\
But for that you'll need consistent, versioned and automated way of creating VMs...
\\
\\
**Meet [Veewee][14a48e29] and [Packer][654b6829]**!

  [654b6829]: https://www.packer.io/ "Packer"
  [14a48e29]: https://github.com/jedi4ever/veewee "Veewee"

> Remember when you first start using kickstart files, first on floppies, then USB pens and finally using the HTTP method?

> Remember trying to find a Web Server to share the kickstart file to the soon to be installed box, then using the`python -m SimpleHTTPServer` and feeling like a hacker?

Well, this is the next step on the evolution and, as I was living under a rock regarding all things related to base VM build automation,
I just started yesterday playing around with these awesome tools (yeah... it was a rainy weekend).

#### The plan was

*  Build a minimal Centos 6.6 x86_64 VirtualBox VM
*  Use my own kickstart files
*  Import into Vagrant and use it as a base box
*  Get all the configs on version control
*  Guarantee it's a fully automated process
*  Lean back and enjoy the show
    * Grab some popcorn while it builds
* Give Veewee and Packer a decent test-drive

\\
So, the next steps were taken to achieve the above requirements (popcorn not included).

---

# Veewee
[RTFM][bf5bdee4]

  [bf5bdee4]: https://github.com/jedi4ever/veewee/blob/master/doc/basics.md "RTFM"

### Get it
{% highlight bash %}
gem install veewee
{% endhighlight %}

### Grab an example
{% highlight bash %}
git clone https://github.com/kintoandar/veewee.git definitions
{% endhighlight %}

### Use it
{% highlight bash %}
# validate config
veewee vbox validate 'centos-6.6-x86_64'

# start build process
veewee vbox build 'centos-6.6-x86_64'
{% endhighlight %}

### Share it
{% highlight bash %}
veewee vbox export 'centos-6.6-x86_64'
{% endhighlight %}

### Import it
{% highlight bash %}
vagrant box add 'centos-6.6-x86_64' './centos-6.6-x86_64.box'
vagrant init 'centos-6.6-x86_64'
vagrant up
vagrant ssh
{% endhighlight %}

### Watch the magic happen

<iframe width="420" height="315" src="//www.youtube.com/embed/6vuqs51xiJ0" frameborder="0" allowfullscreen></iframe><br>

---

# Packer
[RTFM][bb0d94ae]

  [bb0d94ae]: https://www.packer.io/docs "RTFM"

### Get it
{% highlight bash %}
brew tap homebrew/binary
brew install packer
{% endhighlight %}

### Migrating from Veewee?
{% highlight bash %}
# AKA was too lazy to build a packer template
gem install veewee-to-packer
{% endhighlight %}

### Grab an example
{% highlight bash %}
git clone https://github.com/kintoandar/packer.git
{% endhighlight %}

### Use it
{% highlight bash %}
cd packer/centos-6.6-x86_64
packer validate template.json
packer build template.json
{% endhighlight %}

### Import it
{% highlight bash %}
vagrant box add 'centos-6.6-x86_64' './centos-6.6-x86_64.box'
vagrant init 'centos-6.6-x86_64'
vagrant up
vagrant ssh
{% endhighlight %}

### Watch the magic happen
<iframe width="420" height="315" src="//www.youtube.com/embed/Etcmywy0JHs" frameborder="0" allowfullscreen></iframe><br>

<br><br>
**That's all folks!**
\\
\\
And this is how, in a couple of hours, I've became a fan of Veewee and Packer, `#truestory`.
