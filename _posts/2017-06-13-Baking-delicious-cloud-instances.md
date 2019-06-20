---
title: "Baking delicious cloud instances"
excerpt: "A workflow for cloud instances baking and provisioning using ansible and terraform"
header:
  teaser: /images/cake.jpg
  og_image: /images/cake.jpg
toc: true
toc_sticky: true
tags:
  - automation
  - development
  - howto
---

<div style="text-align:center" markdown="1">
![cake](/images/cake.jpg)
</div>

Nowadays, configuration management is getting the backseat on the cloud infrastructure ride.<br>
<br>
With immutable and phoenix servers rising in demand, we tend to see more and more shell scripts taking the spotlight on instance configuration, where Dockerfiles are the supreme example. However, this post is not about containers.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">periodic reminder. Immutable means can&#39;t change not don&#39;t change</p>&mdash; Gareth Rushgrove (@garethr) <a href="https://twitter.com/garethr/status/872440195714621440">June 7, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br>
Let’s put immutable servers aside for a moment and focus on phoenix servers and how to deal with their configuration at boot time, I started thinking there must be a simpler and efficient way to manage their configurations.

## Amazon Web Services

<div style="text-align:center" markdown="1">
![amazon_aws](/images/amazon_aws.png)
</div>

During my career I've worked with bare metal servers, XEN and KVM virtualization, LXC containers and private cloud environments like VMware vCloud and Openstack. This year, I've been looking more closely into Amazon Web Services (AWS), so that’s what I’ll be addressing here.<br>
<br>
So far I’ve seen a couple of patterns:

  * Bake an Amazon Machine Image (AMI) adding a complex shell script to take care of the final provisioning at boot time.
  * Ship the AMI with all the environment configurations and, at boot time, just load the correct one, depending on the environment where it's spun up.

No matter which one you choose, you’ll be left with the same problem: the need to build the AMI baking process and, afterwards, getting the final configuration to run at boot.<br>
<br>
One could argue that service discovery could address the latter, but you would still need to take care of interfacing it with your service. Most of the services out there don't support service discovery... yet. So I won't dwell into that right now.

## Configuration Management

For the past few years I’ve been using Chef and Ansible in complex environments, authored several Chef cookbooks, recipes and providers as well as Ansible playbooks, roles and modules. As such, I have strong opinions regarding each one of these tools. In a nutshell:

<div style="text-align:center" markdown="1">
![chef](/images/Chef.png)
</div>

  * Chef has a steep learning curve and it's hard to get your head around it, but it allows easy management of complex scenarios by having ruby exposed alongside the domain specific language.

<div style="text-align:center" markdown="1">
![ansible](/images/ansible.png)
</div>

  * Ansible is dead simple to learn **and teach**, but quickly becomes problematic when complexity needs to be addressed. “Coding” YAML is a pain and Jinja templates are not a walk in the park either. On the modules’ side python helps quite a lot.
<br><br>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">OH: &quot;Principal YAML Engineer&quot;</p>&mdash; Joel (@kintoandar) <a href="https://twitter.com/kintoandar/status/873489931871694854">June 10, 2017</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
<br>
Don't get me wrong, I really appreciate these tools and most of the deployment orchestration I've helped build ended up using both, taking advantage of the strengths of each.<br>
<br>
Keep in mind that choosing a technology shouldn’t be taken lightly and you must consider the impact on the organization, so truly scrutinize what best suits your requirements. Running after the next shiny tool/hype, the language you feel more comfortable with or the agile framework _‘du jour’_, is meaningless in comparison with the overall company growth you seek, or should aspire to.

> Regardless, nothing beats a shell script, right?

If you're the only one managing the system, sure, but if your goal is to provide the tooling for everyone to use, maybe not so much.<br>
<br>
Becoming someone like Brent ([The Phoenix Project](https://www.goodreads.com/book/show/17255186-the-phoenix-project) IT ninja and all around entreprise bottleneck) is not an option. In order to support the systems’ growth and therefore the business prosperity, we need to ensure technical knowledge is distributed and that everyone is able to modify, improve and use the tooling we build.

## Infrastructure Management

<div style="text-align:center" markdown="1">
![terraform](/images/terraform.png)
</div>

Tools like Terraform try to fill the gap on infrastructure orchestration as a whole, but I wouldn't call it configuration management per se, at least regarding the instances. Assuming your instances reside inside a private subnet, the interaction provided sums up to the [user_data](https://www.terraform.io/docs/providers/aws/r/instance.html#user_data) configuration, injecting a [cloud-init](https://ahmet.im/blog/cloud-instance-provisioning/#cloudinit) script.

## Cooking up a plan

All this got me wondering... _What do I want out of this?_

  * [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) up the process
  * Anyone should understand and feel empowered to modify the baking scripts and the final provision ones
  * Improve code reusability
  * Environment parity

When I got to this list, I started by figuring out how could I meet all of the above and ended up designing a workflow from scratch to achieve all requirements. The following sequence diagram illustrates the workflow:

<div style="text-align:center" markdown="1">
![bakery_sequence](/images/bakery_sequence.jpg)
</div>

**Disclamer:** Being totally honest, my preference would have been Chef instead of Ansible. But since I want more people involved and contributing, I’ve looked for a way to reduce the entry level on the required configuration management knowledge. As described above, I opted for Ansible, trying to keep things simple and straightforward to ease the onboarding of other collaborators.

## Components

This workflow has a few core components, each one with a set of tasks and inherent responsibilities.

### Orchestrator

Where all the tasks are triggered, so pick your poison:

  * Jenkins
  * Travis
  * Thoughtworks Go
  * ...

### Local Cache

Where the project repository is checked out and all dependencies  are stored. This path will be backed up and sent into the AMI at `/root/bakery` by [our Ansible playbook](https://github.com/kintoandar/bakery/).<br>
<br>
When the AMI is instantiated using our cloud-init file, the Ansible playbook will be ran again, now locally, but as the override `cloud_init` will be enabled a different flow will be performed.

### Ansible-galaxy

If you're familiar with the awesome [Berkshelf](https://docs.chef.io/berkshelf.html) and `berks vendor`, ansible-galaxy has a similar purpose to resolve Ansible roles dependencies and create a local copy of them.<br>
<br>
You can even use private repos instead of publicly available roles, if that’s your thing. Here's an example:

{% highlight bash %}
~ $ cat requirements.yml
---
- src: git@github.com:PrivateCompany/awesome-role.git
  scm: git
  version: v1.0.0
  name: awesome-role
{% endhighlight %}

You can download all the required roles using:

{% highlight bash %}
ansible-galaxy install -r ./requirements.yml -p ./roles
{% endhighlight %}

### Ansible

Improves code reusability through roles. Makes configuration templating much easier instead of using cryptic `sed` one liners (even though ❤️ regex).<br>
<br>
If the roles have concerns separated per task file, it’s possible to call the templating features separately from the installation ones. This will truly help split the code workflow for the baking and the final configuration at boot up.

### Packer

<div style="text-align:center" markdown="1">
![packer](/images/packer.png)
</div>

More about it on a [previous post](/2015/01/veewee-packer-kickstarting-vms-into-gear.html).

## Tasting some baked goods

With this approach, the code used for the AMI’s bake is the same as the one used on the final provision during boot up. The only difference is the code flow on the playbook between the two steps.<br>
<br>
I've built a [small example](https://github.com/kintoandar/bakery) to demonstrate how everything comes together so you can try it out. Obviously, this is far, far away from production ready but you'll get the gist and it’ll make the entire workflow much clearer.<br>
<br>
In this example we want to spin up an instance with [Prometheus](https://prometheus.io/docs/introduction/overview/) using a separate data volume, useful for instance failures and service upgrades. The flow is something like this:

<div style="text-align:center" markdown="1">
![bakery_flow](/images/bakery_flow.jpg)
</div>

### Requirements

This demo has the following requirements:

  * AWS API access tokens
  * Packer >= 1.0.0
  * Ansible >= 2.3.0.0

### Mixing the ingredients

For generating an AMI to use in this workflow you just need to run:

{% highlight bash %}
# Get the repo
git clone https://github.com/kintoandar/bakery.git
cd bakery

# Download ansible roles dependencies
ansible-galaxy install -r ./requirements.yml -p ./roles

# Use packer to build the AMI (using ansible)
export AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
export AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXX
packer build ./packer.json
{% endhighlight %}

Now, to test the new AMI, just launch it with an extra EBS volume and use the provided [cloud-init configuration example](https://raw.githubusercontent.com/kintoandar/bakery/master/cloud-init-example.conf) as the [user-data](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html). After the boot, you can check the cloud-init log in the instance:

{% highlight bash %}
less /var/log/cloud-init-output.log
{% endhighlight %}

Be sure that `/root/bakery/cloud-init.json` was created with all the required overrides for Ansible, specially the `cloud_init=true`.<br>

### Profit!

You may destroy and attach a new instance to the separated data volume and Ansible will take care of the logic of dealing with it.<br>
<br>
Using Terraform to manage those instances becomes easier: you only need to take care of templating the cloud-init file and attach the volume to the instance. You may find [here](https://raw.githubusercontent.com/kintoandar/bakery/master/cloud-init-example.conf) an example of a cloud-init configuration that you can use to template.<br>
<br>
Here’s an example of a Terraform script:

{% gist 583a209474e05bbc0cd6738bf909a9a1 terraform_ebs_volume_attach_example.tf %}

## Pro tips

  * You could pass Packer a json file with overrides for Ansible to use during the bake process, taking advantage of [-\-extra-vars](https://www.packer.io/docs/provisioners/ansible.html#extra_arguments).<br>
<br>
  * Terraform [aws_ebs_volume](https://www.terraform.io/docs/providers/aws/r/ebs_volume.html) allows using a snapshot as the base for the data volume, which is quite useful in case of a major problem that forces you to rollback the data volume to a consistent state.

## Ready to be served

I wouldn’t say this is the best workflow ever, but it does check out all the requirements I had. I'll keep you posted on how it goes.<br>
<br>
Happy baking!<br>
<br>
🍰
