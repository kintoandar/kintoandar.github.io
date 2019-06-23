---
title: "Publications"
excerpt: "Publications available"
layout: single
permalink: /publications/
read_time: false
author_profile: true
comments: false
related: false
classes: wide
header:
  image: /images/publications.jpg

feature_row1:
  - image_path: /images/prombook_front.png
    title: "Hands-On Infrastructure Monitoring with Prometheus"
    alt: "Hands-On Infrastructure Monitoring with Prometheus"
    excerpt: 'A book on how to implement and scale queries, dashboards, and alerting across machines and containers'
    url: "/publications/index.html#hands-on-infrastructure-monitoring-with-prometheus"
    btn_label: "Read More"
    btn_class: "btn--info"
feature_row2:
  - image_path: /images/programar_managzine.png
    title: "Programar Magazine"
    alt: "Programar magazine"
    excerpt: 'The winning article of the 37º edition of the Programar magazine'
    url: "publications/index.html#programar-magazine"
    btn_label: "Read More"
    btn_class: "btn--info"
feature_row3:
  - image_path: /images/prombook_front.png
    title: ""
    alt: "Hands-On Infrastructure Monitoring with Prometheus paperback"
    excerpt: '<div style="text-align:center"><a href="https://amzn.to/30UOVoM" class="btn btn--book btn--large" title="book paperback"><i class="fas fa-book" aria-hidden="true"></i><span> Amazon - Paperback</span></a></div>'
  - image_path: /images/prombook_kindle.png
    title: ""
    alt: "Hands-On Infrastructure Monitoring with Prometheus kindle"
    excerpt: '<div style="text-align:center"><a href="https://amzn.to/2QBHlL2" class="btn btn--book btn--large" title="book kindle"><i class="fas fa-tablet-alt" aria-hidden="true"></i><span> Amazon - Kindle</span></a></div>'
  - image_path: /images/prombook_back.png
    title: ""
    alt: "Hands-On Infrastructure Monitoring with Prometheus packt"
    excerpt: '<div style="text-align:center"><a href="https://www.packtpub.com/virtualization-and-cloud/hands-infrastructure-monitoring-prometheus" class="btn btn--book btn--large" title="book packt"><i class="fas fa-book-open" aria-hidden="true"></i><span> Packt - Website</span></a></div><br>'
feature_row4:
  - image_path: /images/programar_managzine.png
    title: ""
    alt: "Programar Magazine"
    excerpt: '<div style="text-align:center"><a href="/images/Revista_PROGRAMAR_37.pdf" class="btn btn--book btn--large" title="Programar Magazine"><i class="fas fa-tablet-alt" aria-hidden="true"></i><span> Free download</span></a></div><br>'
---

{% include feature_row id="intro" type="center" %}

{% include feature_row id="feature_row1" type="left" %}

{% include feature_row id="feature_row2" type="right" %}

## Hands-On Infrastructure Monitoring with Prometheus

{% include feature_row id="feature_row3" %}

### Book Description

*Implement and scale queries, dashboards, and alerting across machines and containers*

Prometheus is an open source monitoring system. It provides a modern time series database, a robust query language, several metric visualization possibilities and a reliable alerting solution for traditional and cloud-native infrastructure.

This book covers the fundamental concepts around monitoring and explores Prometheus architecture, its data model, and how metric aggregation works. Multiple test environments are included to help explore different configuration scenarios, like the use of various exporters and integrations. You’ll delve into PromQL, supported by several examples, and then apply that knowledge to alerting and recording rules, as well as how to test them. After that, alert routing with Alertmanager and creating visualizations with Grafana is thoroughly covered. In addition, this book covers several service discovery mechanisms and even provides an example of how to create your own. Finally, you’ll learn about Prometheus federation, cross-sharding aggregation and also long-term storage with the help of Thanos.

By the end of this book, you’ll be able to implement and scale Prometheus as a full monitoring system on-premises, in cloud environments, in standalone instances or using container orchestration with Kubernetes.

[Official book website](https://www.prombook.info){: .btn .btn--info}

### What You Will Learn

* Grasp monitoring fundamentals and implement them using Prometheus
* Discover how to extract metrics from common infrastructure services
* Find out how to take full advantage of PromQL
* Design a highly available, resilient, and scalable Prometheus stack
* Explore the power of Kubernetes Prometheus Operator
* Understand concepts such as federation and cross-shard aggregation
* Unlock seamless global views and long-term retention in cloud-native apps with Thanos

### Chapters

1. Monitoring Fundamentals
2. An Overview of the Prometheus Ecosystem
3. Setting Up a Test Environment
4. Prometheus Metrics Fundamentals
5. Running a Prometheus Server
6. Exporters and Integrations
7. Prometheus Query Language - PromQL
8. Troubleshooting and Validation
9. Defining Alerting and Recording Rules
10. Discovering and Creating Grafana Dashboards
11. Understanding and Extending Alertmanager
12. Choosing the Right Service Discovery
13. Scaling and Federating Prometheus
14. Integrating Long-Term Storage with Prometheus

## Programar Magazine

{% include feature_row id="feature_row4" type="center" %}

This magazine has been around for more than a decade, and its core purpose is to improve Portuguese citizens technology awareness, skills and ensure knowledge dissemination. The magazine tackles subjects like programming languages, operating systems, security, networking, testing and automation while being completely free.

### Introduction to password auditing

I was invited, in the scope of a Portuguese infosec community, to write an article regarding password strength auditing, while expanding on concepts like hashing, salting and available attack vectors.

The article covers CPU vs GPU based cracking approaches to obtain collisions of widely known hashing algorithms like MD5, SHA-1, SHA-256, SHA-512 and even salted MD5.

The results are thoroughly explained and presented on a side-by-side structure, ensuring a comprehensive comparison of every strategy taken. The article (available on page 57) is written in Portuguese, but the data speaks for itself.

[Read the article](/images/Revista_PROGRAMAR_37.pdf){: .btn .btn--info}
