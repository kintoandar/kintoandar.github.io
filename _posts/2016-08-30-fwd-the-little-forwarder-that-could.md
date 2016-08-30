---
layout: post
title: "fwd - The little forwarder that could"
excerpt: "Building a network port forwarder in golang"
author: Joel Bastos
modified: 2016-08-30
tags:
comments: true
image:
  thumb: golang.png
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

🚂

#### About
[fwd](https://github.com/kintoandar/fwd) is a network port forwarder written in golang.<br>
It's cross platform, supports multiple architectures and it's dead simple to use.<br>
<br>
In this post I'll talk about this tool and my approach to the process of automating the build of an application in golang.<br>

----

#### Motivation
I've increasingly been hearing great things regarding the Go Language and thought it might be worth a shot digging into it.
As usual, there's nothing better than creating a project with the right motivation to learn the language while maintaining a high level of interest.<br>

<div style="text-align:center" markdown="1">
![github_logo](/images/github.png)
</div>

Thus I have some projects on my github that were conceived purely to get my interest going on a particular technology, some of them were developed with no clear issue to overcome but with lots of know-how to squeeze from. However, from time to time I get the feeling I might be solving a real problem, not only mine but of the community as well, and [git-hooks](https://github.com/kintoandar/git-hooks) is one those projects.<br>
<br>
As `fwd` is currently filling a gap on my _tools-of-the-trade-belt_, I suppose this project might be useful for other users too.<br>
<br>
I won't go into the technical implementation details but if you want to dig deeper into TCP/IP and writing network apps I recommend [this post](http://www.cubrid.org/blog/dev-platform/understanding-tcp-ip-network-stack/).

----

#### Scenarios
Two scenarios to keep in mind.

>Every now and then, I get a friend asking for advice or help on a project/configuration problem on their infrastructure, and not everyone is running a public facing `OpenSSH-Server` that I can connect through. There are some tools that can help you with that like the awesome `ngrok`, but what happens if the server you want to connect is not local to your friends box, like a home router? For the purpose of this scenario let's try to avoid full remote desktop apps (just too messy imho).

>You have an app server running on a non privileged port and for the sake of testing you need to access it through a standard HTTP/S port, without restarting the service. Once again you might use `nginx`, `xinetd` or some other trick to get that setup, but it's too much of an hassle just for a quick test.

----

#### Requirements
I decided to use golang to build a tool to solve these scenarios, having `Keep It Simple`™ as my motto.<br>
These were the requirements for the application:

   * Rich command line experience
   * Be able to pass arguments as environment variables (calling the app name should suffice to run it)
   * Get acquainted with golang's _Package net_ (which is awesome by the way)
   * Get a feel for _goroutines_ and _channels_
   * Automatically build and distribute binaries for most platforms/architectures

----

#### Use Cases
So what is `fwd` useful for? Here are a couple of use cases which demonstrate the application features.



##### Simple Forwarder
Forwarding a local port to a remote port on a different network:

{% highlight bash %}
                         +-----+                       +-----+
       192.168.1.99:8000 |     |       172.28.128.3:80 |     |
curl +-----------------> | fwd | +-------------------> | web |
                         |     | 172.28.128.1          |     |
                         +-----+                       +-----+
{% endhighlight %}

![demo](https://docs.google.com/uc?id=0B-SEc73VBiUwN0RheHVYQ3RlbW8)

----

##### fwd ♥️ ngrok
I must admit `ngrok` was an huge inspiration for `fwd`. If you don't know the tool you should definitely check out [this talk](https://www.youtube.com/watch?v=F_xNOVY96Ng) from [@inconshreveable](https://twitter.com/inconshreveable).<br>
<br>
This tool combo (fwd + ngrok) allows some wicked mischief, like taking [firewall hole punching](https://en.wikipedia.org/wiki/Hole_punching_(networking)) to another level! And the setup is trivial.<br>
<br>
`ngrok` allows to expose a local port on a public endpoint and `fwd` allows to connect a local port to a remote endpoint. You see where I'm heading with this... With both tools you can connect a public endpoint to a remote port as long as you have access to it.<br>
<br>
Here's how it works:

{% highlight bash %}
                         +-----+                       +-----+
                   :9000 |     |       172.28.128.3:22 |     |
Internet +-------------> | fwd | +-------------------> | ssh |
tcp.ngrok.io:1234        |     | 172.28.128.1          |     |
                         +-----+                       +-----+
{% endhighlight %}

{% highlight bash %}
# get a public endpoint, ex: tcp.ngrok.io:1234
ngrok tcp 9000

# forward connections on :9000 to 172.28.128.3:22
fwd --from :9000 --to 172.28.128.3:22

# get a shell on 172.28.128.3 via a public endpoint
ssh tcp.ngrok.io -p 1234
{% endhighlight %}

_With great power comes great responsibility._<br>
- Ben Parker

----

#### Community Packages
To make this project a reality I've used some great golang packages built by the community, standing in the shoulders of giants and all.<br>
<br>
If you don't know them, you should probably check them out, they made my life much easier:

<div style="text-align:center" markdown="1">
![golang_logo](/images/golang.png)
</div>

   * [urfave/cli](https://github.com/urfave/cli): _"cli is a simple, fast, and fun package for building command line apps in Go. The goal is to enable developers to write fast and distributable command line applications in an expressive way."_

   * [fatih/color](https://github.com/fatih/color): _"Color lets you use colorized outputs in terms of ANSI Escape Codes in Go (Golang). It has support for Windows too! The API can be used in several ways, pick one that suits you."_

   * [mitchellh/gox](https://github.com/mitchellh/gox): _"Gox is a simple, no-frills tool for Go cross compilation that behaves a lot like standard go build. Gox will parallelize builds for multiple platforms. Gox will also build the cross-compilation toolchain for you."_

----

#### Build Pipeline
In order to take a project seriously, you need to have some automation on the build and distribution of your artifacts.<br>
<br>
Next I'll show you how I've setup the build system for this application.


##### Travis
_"Travis CI is a hosted continuous integration and deployment system."_<br>
<br>
It is such a delight to use, it simply doesn't get in your way, it's trivial to setup and above all there's a huge community backing it up, so rest assured you'll always find an answer if you ever hit an issue.<br>

<div style="text-align:center" markdown="1">
![travis_logo](/images/travis.png)
</div>

I wanted a build to run on every commit, deploy on tags and publish artifacts somewhere. Also, after a `git push`, no manual intervention should be required. Eventually I ended up with this configuration:

{% gist b4f1b55dee0d8880c697157b860af977 .travis.yml %}

The following keys are probably worth mentioning:

   * **tip**: Latest Go version
   * **file**: Configuration file for bintray
   * **secure**: Generated by `travis encrypt BINTRAY_API_KEY --add deploy.key`
   * **tags**: Run the deploy step on tags only

You can find a successful build and deploy log [here](https://travis-ci.org/kintoandar/fwd/builds/155752647).

----

##### Bintray
I needed a place to store and distribute the build artifacts generated by `gox`. Since the upload had to be automated, bintray seemed like a good option.<br>

<div style="text-align:center" markdown="1">
![github_logo](/images/bintray.png)
</div>

The travis + bintray integration was very simple to configure and, even though I'm currently using the service as a full fledged web server (with an upload API), it gets the job done.<br>
<br>
You can find at [my bintray endpoint](https://dl.bintray.com/kintoandar/fwd/) all application versions, alongside with the hash of every binary.<br>
<br>
The configuration I've used can be found [here](https://github.com/kintoandar/fwd/blob/master/.bintray.json), nothing exotic about it I'm afraid, just tailored the provided template.

----

##### Bumpversion
I always follow semantic versioning on my projects and `fwd` is no exception.<br>
<br>
On my python applications I got used to [bumpversion](https://github.com/peritus/bumpversion), the funny thing is I never saw it as a language independent tool, which it certainly is.<br>
<br>
My use case was pretty simple:

   1. Bump major, minor or patch version on several files
   1. Create a new tag with the new version


{% gist b4f1b55dee0d8880c697157b860af977 .bumpversion.cfg %}

The following keys are probably worth mentioning:

   * **current_version**: Keeping state of the current version
   * **commit**: Commit when bumping a version
   * **tag**: Create a tag when bumping a version
   * **bumpversion:file**: Where to look for version numbers

Simple usage example:

{% highlight bash %}
# validate config
bumpversion patch --dry-run --verbose

# automatically bump version
bumpversion patch
{% endhighlight %}

----

#### That's it, that's all
`fwd` code is available at [github](https://github.com/kintoandar/fwd), so check it out (pun intended).<br>
<br>
Happy forwarding!
