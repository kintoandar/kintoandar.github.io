---
title: "Building healthier containers"
excerpt: "Deconstructing containers and examples to better understand the technology"
header:
  teaser: /images/containers_not_vms.jpg
  og_image: /images/containers_not_vms.jpg
toc: true
toc_sticky: true
tags:
  - containers
  - linux
  - howto
  - security
---

<div style="text-align:center" markdown="1">
![lightweightvm](/images/containers_not_vms.jpg)
</div>

## Intro
Containers are <b>nothing</b> like virtual machines!<br>
<br>
Now that we've cleared that up, this post will try to shed some light regarding:
  * How containers, as we know them, came to exist
  * Major differences between containers and virtual machines
  * Examples of how to build minimal containers
  * Demystifying the `scratch` container
  * Examples of how to debug running containers using other containers
  * Benefits of minimal containers
  * Tools that help build minimal containers

### Disclaimer

I’ll be using docker throughout this post as it’s more widely used, but these concepts should apply to other runtime environments like, for example, rkt, lxd or containerd.


## It’s all about abstraction

When virtual machine [Hypervisors](https://en.wikipedia.org/wiki/Hypervisor) started their rise, they provided full or paravirtualization, fancy names for virtualizing everything or using special drivers on the guest to improve the manipulation of the real machine (host). Both guest and host had a full operating system copy, including their own kernel, libraries, tools and so on.<br>
<br>
With containers (jails, zones, etc.), the host and the “guest” share the same kernel to achieve process isolation. Eventually, a set of nifty new Linux kernel features called [cgroups(7)](http://man7.org/linux/man-pages/man7/cgroups.7.html) (CPU, memory, disk I/O, network, etc.) and [namespaces(7)](http://man7.org/linux/man-pages/man7/namespaces.7.html) (mnt, pid, net, ipc, uts and user) appeared to better restrict and enforce that isolation.

<div style="text-align:center" markdown="1">
![lxc](/images/lxc.png)
</div>

It used to be a very daunting task to manage those kernel features, so tools were created to abstract that complexity. [LXC](https://linuxcontainers.org/) was the first I used and spent more time with. It wasn't very user friendly, but it got the job done.<br>
<br>
Apparently, it was so cool that some folks created an abstraction layer over it to make it trivial to anyone. I first saw that abstraction, back in 2013, showcased on this [talk by Solomon Hykes](https://www.youtube.com/watch?v=wW9CAH9nSLs), an engineer working for a company called dotCloud, nowadays known as Docker.

<div style="text-align:center" markdown="1">
![docker](/images/docker_2018.png)
</div>

And the rest is history. Eventually docker dropped the need for LXC, it now deals with the kernel features abstraction directly (libcontainer) and has an entire ecosystem for container management.


## But it still looks like a Virtual Machine to me

I can understand why we compare containers to virtual machines. They “feel” the same, and that’s great.
But keep in mind virtual machines need their own kernel, init system, drivers, etc., and containers just use the host’s kernel to isolate processes (preferably, one process per container).<br>

>So, why are people shipping an entire kernel and system tooling inside a container, generating massive images with stuff that will never be used?<br>

The container runtime provides the basic filesystem and kernel features for your application to run, which means you can focus on your aplication and benefit from the advantages of a minimal container.<br>
<br>
I've prepared a few examples to help materialize these concepts.


## Meet busybox

<div style="text-align:center" markdown="1">
![busybox](/images/busybox.png)
</div>

[Busybox](https://busybox.net/about.html) is a very handy binary. It performs several functions depending on how it’s called. We’ll use it as our example application:

{% highlight bash %}
mkdir -p /tmp/container/bin
cd /tmp/container/bin
curl -LO https://busybox.net/downloads/binaries/1.27.1-i686/busybox
chmod +x ./busybox
# If you want all the things
# for T in $(busybox --list); do ln -s busybox $T; done
ln -s busybox ls
ln -s busybox sleep
cd /tmp/container
tar -cvf /tmp/container.tar .
{% endhighlight %}

And now that we have a new shiny tar file (container image) with a binary, a couple of symlinks and with no kernel or extra junk, it’s time to import it:

{% highlight bash %}
# myapp is just a tag
docker import /tmp/container.tar myapp
{% endhighlight %}

At this time, things are starting to get interesting. Let’s try running our `myapp` container and do a simple `ls`:

{% highlight bash %}
docker run -ti myapp /bin/ls -lah
total 16
drwxr-xr-x    1 0        0           4.0K Dec 28 15:41 .
drwxr-xr-x    1 0        0           4.0K Dec 28 15:41 ..
-rwxr-xr-x    1 0        0              0 Dec 28 15:41 .dockerenv
drwxr-xr-x    2 501      0           4.0K Dec 28 15:39 bin
drwxr-xr-x    5 0        0            360 Dec 28 15:41 dev
drwxr-xr-x    2 0        0           4.0K Dec 28 15:41 etc
dr-xr-xr-x  133 0        0              0 Dec 28 15:41 proc
dr-xr-xr-x   13 0        0              0 Dec 28 15:41 sys
{% endhighlight %}

Where did all that stuff come from? Shouldn’t it only have `/bin`?<br>
<br>
There are differences between a container image and that same image during runtime. The [Open Container Initiative (OCI) libcontainer spec](https://github.com/opencontainers/runc/blob/master/libcontainer/SPEC.md) explains it quite nicely.


## That’s sourcery, I want my Dockerfile back

Sure, whatever rocks your boat.<br>
You probably heard about the `scratch` container. Let’s build our own and call it `zero`:

{% highlight bash %}
cd /tmp/container

# Create and import an empty container image, just like scratch
touch zero.tar
docker import zero.tar zero

# Generate a Dockerfile for our app
cat <<EOF> Dockerfile
FROM zero
COPY bin/ /bin/
EOF

# Build and run our app
docker build . -t myapp-zero
docker run -ti myapp-zero /bin/ls -lah
{% endhighlight %}


### Spoiler alert

If we're on the same page, you must be realizing that all this fuss around containers should be instead around tar files, right?

🤔

## I demand a shell

One could argue that a shell is mandatory for debugging. Obviously strace has to be present, but what if I need to copy files from/to the container? Maybe use a SSH daemon?<br>
<br>
Well, let me put this crystal clear: <b>You don’t!</b><br>
<br>
As one of the underlying building blocks of containers are namespaces, you can use [nsenter(1)](http://man7.org/linux/man-pages/man1/nsenter.1.html) to run programs with namespaces of other processes.<br>
<br>
If that’s so, why don’t we use the same PID/NET namespace between containers, effectively sharing those resources?<br>
<br>
For instance, you could build a toolkit container with all the tools one could ever need and attach it to a container that doesn’t even have a shell.<br>
<br>
I, for one, [did exactly that](https://github.com/kintoandar/dockerfiles#toolkit). And we’ll be using it in this example:

{% highlight bash %}
# Instantiate myapp using sleep to keep it up
docker run -tid myapp /bin/sleep 600

# Get the hash of the running myapp
CONTAINER_HASH=$(docker ps | grep myapp | grep Up | awk '{print $1}')

# Copy something to myapp from the host
touch SOMETHING
docker cp SOMETHING $CONTAINER_HASH:/bin

# Attach a toolkit container to myapp
docker run -it \
  --pid=container:$CONTAINER_HASH \
  --net=container:$CONTAINER_HASH \
  --cap-add sys_admin \
  kintoandar/toolkit
{% endhighlight %}

Now we're on a bash shell in the `toolkit` container attached to the running `myapp`. Let's look around.

{% highlight bash %}
root@d10ba9eb50c7:/# ps aux
PID   USER     TIME   COMMAND
    1 root       0:00 /bin/sleep 600
    6 root       0:00 bash
   15 root       0:00 ps aux
{% endhighlight %}

We can see the `sleep` process is running as PID 1, but where’s the `myapp` filesystem?

{% highlight bash %}
root@d10ba9eb50c7:/# ls -lah /proc/1/root/bin/
total 908K
drwxr-xr-x 1  501 root 4.0K Dec 29 19:13 .
drwxr-xr-x 1 root root 4.0K Dec 29 19:13 ..
-rw-r--r-- 1  501 root    0 Dec 29 19:13 SOMETHING
-rwxr-xr-x 1  501 root 900K Dec 29 18:43 busybox
lrwxrwxrwx 1  501 root    7 Dec 29 18:43 ls -> busybox
lrwxrwxrwx 1  501 root    7 Dec 29 18:43 sleep -> busybox
{% endhighlight %}

So, do you still think someone needs a shell and all those tools on the `myapp` container?<br>
<br>
I can argue that there’s someone who would if, per example, a remote code execution vulnerability on the application was found. In this case, that malicious someone would love to have a shell laying around and maybe some useful tools like curl/wget.<br>
<br>
With that said, let’s then strive to restrict the attack surface on our containers and, as a bonus, you’ll get:

  * Less network bandwidth required to move container images around
  * Less storage requirements due to image size
  * Less IOPS needed due to image size
  * Less software equals less vulnerabilities to scan, manage, patch, upgrade…
  * Faster build times
  * Faster ship times


## Dependency hell

I get it,  it’s hard to manage all the dependencies of a real application and completely detach it from the operating system where it was built, but rest assured, there are more people who feel the same and the community is here to help.<br>
<br>
These are some tools to make things less painful:

  * [docker multi-stage build](https://docs.docker.com/engine/userguide/eng-image/multistage-build/)
  * [dnf using installroot](http://dnf.readthedocs.io/en/latest/command_ref.html)
  * [Debootstrap](https://wiki.debian.org/Debootstrap)

If you want to have complete control of what’s inside your container and not depend on prebuilt packages (rpm, deb, etc.), just use [buildroot](https://buildroot.org/).

<div style="text-align:center" markdown="1">
![buildroot](/images/buildroot.png)
</div>

For more buzzwordy tools I recommend [this talk](https://www.youtube.com/watch?v=5D_SqLv92V8) from Michael Ducy.


## That’s it, that’s all

Well, not quite, this is just the beginning. There are a lot of standards/implementations evolving and being adopted (OCI, CNI, CRI, etc.).

<div style="text-align:center" markdown="1">
![oci](/images/oci.png)
</div>

All of them improve the ecosystem around containerization allowing everyone to step in and contribute.<br>
<br>
Containers are here to stay and understanding what makes them tick is no longer optional.
