---
title: "Nobody wants to be woken up at 4 am"
excerpt: "The journey and current state of the Farfetch monitoring stack"
toc: true
toc_sticky: true
header:
  teaser: /images/peppered-pixels-unsplash.jpg
  og_image: /images/peppered-pixels-unsplash.jpg
tags:
  - monitoring
  - automation
created: 2019-07-01
updated: 2019-07-01
cross_post:
  name: Farfetch Tech Blog
  url: https://web.archive.org/web/20231005022856/https://www.farfetchtechblog.com/en/blog/post/nobody-wants-to-be-woken-up-at-4-am/
---

<figure class="gallery">
  <img src="/images/peppered-pixels-unsplash.jpg" alt="A grey telephone handset with a red coiled cord lying on a dark duvet" fetchpriority="high">
  <figcaption>Photo by <a href="https://unsplash.com/photos/a-sleeping-bag-with-a-phone-hooked-up-to-it-DhW77WKAgyE">Peppered Pixels</a></figcaption>
</figure>

## At the beginning

Farfetch journey into monitoring started since its foundation, 10 years ago.\
As one might expect, several approaches were tested, implemented and discarded along the way. This organic growth brought a high proliferation of tools to solve specific use-cases, usually not aiming for a consistent and holistic solution for the company monitoring needs.

Speaking in the infrastructure context, we could distil the monitoring tooling being used into two components:

- A paid open-source [blackbox](https://landing.google.com/sre/sre-book/chapters/monitoring-distributed-systems/) type software, which was also integrated with our centralised logging system (querying data via active checks).
- A paid closed-source [whitebox](https://landing.google.com/sre/sre-book/chapters/monitoring-distributed-systems/) software-as-a-service (SAAS).

These were the two main solutions if you required monitoring in infrastructure. The SAAS was normally only useful when debugging an issue, not so much for alerting. Regarding the blackbox tool, tens of thousands of ad-hoc checks were created throughout the years.

With such amount of alerts, their traceability and ownership became lost, although the manual process to configure new checks or alerting routes wasn’t helping either. The management toil for such a system was tremendous. Having hundreds of triggering alerts became the status quo and alert fatigue settled in. It became usual to be woken up several times a night for trivial things like single instance CPU pressure.

## The turning point

We decided it was time to stop, think and solve our on-going issues, because nobody wants to be woken up at 4 AM for something that doesn’t impact our customers.

Monitoring, in our current context, is interpreted as metrics and its related visualisation and alerting.

So, we started talking with potential stakeholders, collected their requirements, added our own and came up with this list:

- Whitebox and blackbox monitoring
- Highly available and easily scalable
- Flexible and pluggable alert routing (slack, ticketing systems, email, pager, etc.)
- Self-service
- Complete automated workflow
- Fully auditable process for changes
- Metric collection for all infrastructure services (Databases, Queuing Services, Caching Services, Web servers, Homegrown tools, etc.)
- Instance and container level metric collection
- Future proofing the choice for APM
- Future proofing the choice for cross-datacenter aggregation
- Future proofing the choice of long-term metric storage

We validated several solutions (free/paid, close/open source) against that list and weighed the pros and cons in a fully transparent way so the entire company could pitch in. In retrospective, I believe that was one of the cornerstones for the success of the current solution. Everything was laid out for everyone to see, not only the benefits but most importantly the shortcomings, so no expectation could be mismatched.

As most tough problems weren’t technical, we also needed a shift in mindset regarding alerting. We needed to step away from the "that alert is normal”, so we dropped the alerting levels altogether and replaced them with the following approach:

| Urgency | Kind         | Delivery Method        |
|---------|--------------|------------------------|
| Now     | Alert        | Pager / Call           |
| Later   | Notification | Ticket / Email / Slack |

Another major shift was regarding documentation. To have a new alert approved, documentation must be available on the meaningfulness of the alert, what are the troubleshooting steps and how one could go about fixing it. Moreover, this approach made us start paying close attention to service instead of instance level signals, stepping into [RED](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/), [USE](http://www.brendangregg.com/usemethod.html) and [Google’s four golden signals](https://landing.google.com/sre/sre-book/chapters/monitoring-distributed-systems) territory.

To achieve our goals, we collectively decided on Prometheus as our main tool, back then an incubating project at the Cloud Native Compute Foundation (CNCF). Obviously, moving away from a SAAS would incur in more time spent doing something not related to the company core business, but in this specific case, we figured we could gain so much more, besides the obvious cost reduction when choosing the free and open-source path.

Coincidently, about the same time we embarked on this endeavour, another company-wide project was born to abstract the interactions between infrastructure and other business units. We are using the concept of "blueprints”, exposed in the previous post, [The Language of Infrastructure](https://web.archive.org/web/20231208225625/https://www.farfetchtechblog.com/en/blog/post/the-language-of-infrastructure/), as a definition of requirements on infrastructure. This YAML-based construct allows the automation of, for example, application build definition, instance provisioning, deployment, access control, etc. So, we integrated alerting onto blueprints as well, making it entirely self-service.

## What we have now

We designed a Prometheus-based stack that could be easily provisioned on each of our datacenters, making it as cloud vendor agnostic as possible, and ensuring no manual configuration was required. The following diagram represents the logical representation of the final result, and we’ll provide an overview of each component.

![Monitoring stack: a load balancer in front of Grafana with Thanos Querier, Prometheus shards with Thanos Sidecar, Blackbox Exporter and custom service discovery, Alertmanager with alerts2elastic, and notification routes to Elasticsearch, Pager, Slack and Email](/images/farfetch_monitoring_stack.png)

From the get-go, we needed to isolate the state of the stack to Prometheus itself so any other component could be scaled horizontally without effort.

## About the Components

### Grafana

[Grafana](https://grafana.com/) represents the visualisation component for the stack. The choice is a no-brainer due to the tight integration with Prometheus and PromQL, the Prometheus query language.

The dashboards are built to be agnostic from the datacenter or the environment, enforcing templating on pretty much any Prometheus query. They are added via merge request and, after proper validation, are deployed to every instance.

Because we fully reset Grafana in each deployment, we hit an issue where folder/dashboards IDs would change across instances, causing the folder structure to break when requesting data from different nodes. For a while, we worked around this by using sticky sessions on the Load Balancer. To permanently fix our problem, we built a module that talks to the Grafana API to ensure the correct IDs for folders/dashboards so that sticky sessions on the load balancer are no longer required. These dashboards are read-only since changes are available solely via source control.

Another issue we faced was due to the sharding of Prometheus servers, making extremely complex to build dashboards using metrics across shards. Thankfully, a brand new open-source project called [Thanos](https://github.com/improbable-eng/thanos) was starting to get some traction. I kindly call Thanos the "silver bullet” for some of Prometheus shortcomings, like long-term storage and, in this case, solving the cross-shard dashboard querying.

### Prometheus

The heart and soul of the stack. We made it so the sharding aspect of the clusters would be easily manageable via source control and that we could add or remove shards quickly when required, which includes all shard-specific configurations. One issue we bumped into was the service discovery for our cloud provider. Since service discovery was being run per scrape job and as we do have thousands of instances, we quickly realised this wouldn’t scale. Furthermore, we suddenly started hitting the rate limit of the provider API. Thus, we built our own service discovery engine.

![Prometheus go_goroutines graph comparing native service discovery with the initial and final versions of the custom service discovery](/images/farfetch_prometheus_service_discovery.png)

Alongside the Prometheus server, we also deployed the very handy [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter), which we use to run ICMP checks against instances, validate TLS certificates, probe application health-checks, etc.

Alerting rules are also deployed in each shard, via the blueprints. Here’s an example of a code snippet:

```yaml
alerting:
  contacts:
    email: example@example.com
    slack: example-channel
    pager: examplepagertoken
  alerts:
    - alertname: AlertmanagerNotificationsFailing
      expression: rate(alertmanager_notifications_failed_total[5m]) > 0
      for: 5m
      notify:
        - environment: dev
          routes: [slack, email]
        - environment: prd
          routes: [slack, email, pager]
      dashboard: alertmanager_notifications_stats
      description: '{{$labels.job}} in instance {{$labels.instance}} is failing to send notifications for integration {{$labels.integration}}'
      troubleshooting: https://wiki.example.com/troubleshooting/AlertmanagerNotificationsFailing
```

Similar to the dashboards, the alerting rules are agnostic of the datacenter, but notification routes can be tailored per environment.

As we have several teams using this workflow and we wanted to provide the best experience as possible, decreasing the complexity of the alert creation process was mandatory. To achieve this goal, we abstracted some of the more exotic PromQL queries into bite-sized expressions, for example:

```
100 * container_memory_working_set_bytes{id=~"/docker/.*"} / ((container_spec_memory_limit_bytes{id=~"/docker/.*"} == 0) + on (instance) group_left () label_replace(node_memory_MemTotal_bytes, "instance", "$1:8080", "instance", "([^:]+):.+") or (container_spec_memory_limit_bytes{id=~"/docker/.*"} > 0))
```

Using Prometheus recording rules, the previous alert is converted to:

```
container_mem_used_percent{name="container-example"} > 90
```

This greatly streamlines the onboarding of new teams, eases the code review process and improves the overall Prometheus server performance.

Here you can find a high-level deployment method:

![Sequence diagram: a developer pushes a blueprint to the code repository, which runs unit tests and code review; the orchestrator checks out the blueprint, builds the Prometheus configuration and, for each shard and Prometheus instance, issues the configuration, runs pre-flight checks, deploys it, runs post-flight checks and returns the state](/images/farfetch_prometheus_deployment.jpeg){.align-center}

All deployments are strictly idempotent, which allows them to roll out as many times as required.

### Alertmanager

Alertmanager is responsible for routing alerts to their destination. We did have an extra requirement regarding the generation of reports about all fired alerts so we could better understand what’s going on in this globally distributed infrastructure. To fulfil this need, we built a service that pushes every triggered alert to Elasticsearch, making it easier to visualise the history of alerts.

Also, to guarantee that we are aware if Alertmanager, for any reason, is unable to send alerts, we have also implemented a deadman's switch, which is basically an always firing alert that if it ever stops firing, we get paged to investigate.

### Exporters

Something that is missing in the above diagram is the exporters. To be completely honest, I’ve lost count on the number of different exporters we currently have. We actively contribute to some of them and plan to continue doing so. The thriving community around Prometheus is just incredible - and we are proud to be part of it.

## Summary

The initial working proof-of-concept of this stack was delivered within two months, successfully replacing our SAAS solution. We did take a few risks relying on some very new technology and the risks paid off. Obviously, backup plans were always thought out so our progress was never blocked. A couple of months later, the first official communication from Thanos was published. In August, we were at Google’s Office in Munich attending PromCon when it was announced that Prometheus became the second project to graduate at the CNCF, following Kubernetes. These announcements further validated the choices we made.

The mindset is still changing across Farfetch but the full ownership and self-service approach make it enticing to jump onboard. Currently, the ingested metrics, from all the deployed stacks, sum up to over 600K data points per second and increasing on a daily basis.

It has been quite the ride and it doesn’t seem it’s going to slow down any time soon, but we’re excited about it and we do hope to get the opportunity to open-source all the code we’ve written.

This was a birds-eye overview of the journey so far, and our sleep pattern became indeed much better.
