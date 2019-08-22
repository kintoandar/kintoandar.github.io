---
title: "Cooking with Containers"
excerpt: "Creating testing workflows with containers using docker, coreos and test-kitchen"
date: 2014-11-22
header:
  teaser: /images/kitchen.png
  og_image: /images/kitchen.png
toc: true
toc_sticky: true
tags:
  - containers
  - development
  - automation
  - howto
---

If you follow my blog you probably already know I've been playing around with docker and CoreOS from sometime now.
Even though I have several KVM instances of CoreOS running on my home server, I felt the need to have a VM on my mac to learn more stuff on the go.

I've spined up a CoreOS vagrant and started having some fun.

<div style="text-align:center" markdown="1">
![coreos](/images/coreos.png)

<i class="fa fa-plus"></i>

![Docker](/images/Docker.png)
</div>

Yeah, yeah, I know there's **boot2docker**, that abstracts everything in a easy install, so why have all the fuss of getting CoreOS up and running?
Because I believe CoreOS will be **the** building block of the future of containerisation. And the time for learning about it, is now!

I started by building my first docker image from scratch. Things escalated quite quickly and I ended up with an awesome chef cookbook testing setup, almost by accident :p

Hoping you might find my setup useful as it's been for me, here's a blog post explaining how to get it up and running.

## Software spec
For comparison purposes, these were my software versions when I wrote this post:

|**Package**|**Version**|
|===========|===========|
|Mac OS X|10.9.5|
|Virtualbox|4.3.18|
|Vagrant|1.6.5|
|CoreOS|505.1.0|
|Docker|1.3.0|
|ChefDK|0.3.5|
|test-kitchen|1.2.1|
|kitchen-docker|1.5.0|

<br>

<div style="text-align:center" markdown="1">
![vagrant](/images/vagrant.png)

<i class="fa fa-plus"></i>

![virtualbox](/images/virtualbox.png)
</div>

## Lets get down to business
Download and install the following packages:

* [Homebrew](http://brew.sh/)
* [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
* [Vagrant](https://www.vagrantup.com/downloads.html)
* [Chef Development Kit (chefdk)](https://downloads.getchef.com/chef-dk/)

### Install the test-kitchen gem and its docker driver
{% highlight bash %}
chef gem install test-kitchen
chef gem install kitchen-docker
{% endhighlight %}

### Install docker
{% highlight bash %}
brew update
brew install docker
{% endhighlight %}

### Clone CoreOS vagrant config and spin it up
{% highlight bash %}
git clone https://github.com/coreos/coreos-vagrant.git
cd coreos-vagrant
vagrant up
vagrant ssh
{% endhighlight %}

### Enable remote API for docker
By default, CoreOS has the docker API listening on a local socket.
As we're going to manage containers remotely we'll need to make docker available on a TCP socket (more info about this [here](https://coreos.com/docs/launching-containers/building/customizing-docker/)).

On the CoreOS box create the following file `/etc/systemd/system/docker-tcp.socket` and add this:
{% highlight bash %}
[Unit]
Description=Docker Socket for the API

[Socket]
ListenStream=2375
BindIPv6Only=both
Service=docker.service

[Install]
WantedBy=sockets.target
{% endhighlight %}

Then enable the new socket:
{% highlight bash %}
sudo su -
systemctl enable docker-tcp.socket
systemctl stop docker
systemctl start docker-tcp.socket
systemctl start docker
{% endhighlight %}
And **logout** from the CoreOS box.

### Adding a friendly name
On your host, add a friendly hostname for your CoreOS instance

{% highlight bash %}
sudo echo "172.17.8.101 coreos01" >> /etc/hosts
{% endhighlight %}

### Export the new docker endpoint and test it out
{% highlight bash %}
export DOCKER_HOST=tcp://coreos01:2375
docker ps -a
{% endhighlight %}
You should see something like this:

![docker_ps](/images/docker_ps.png)
<br>

**Note:** If you can't reach the coreos guest via 172.17.8.101 it might be related to an overlapping route on your host.
You'll need to add a new route, here's an example:
`route -vn add -net 172.17.8.0/24 -interface vboxnet1`
{: .notice--danger}

## That's it, let the cooking begin
<div style="text-align:center" markdown="1">
![Chef](/images/Chef.png)

<i class="fa fa-plus"></i>

![kitchen](/images/kitchen.png)
</div>

I've made available on github an example so you can start testing your setup right away.
{% highlight bash %}
git clone https://github.com/kintoandar/cooking_with_containers.git
cd cooking_with_containers
kitchen converge
{% endhighlight %}
This will download a docker image I've built from the public docker hub, start a new container, push an example cookbook into it, generate a runlist and do a chef-solo run with that runlist, all **like magic**.

If all went according to plan, you just converged your first container testing an _useless_ cookbook. So give yourself a pat on the back, good job!

Now you can go on and build _awesome_ cookbooks, fully tested on your new shiny setup, **enjoy**!

**Pro-tip:** vim + syntastic + rubocop + foodcritic = another #epic combo!
{: .notice--info}
