---
layout: post
title: "Certificates Mumbo Jumbo"
author: Joel Bastos
modified:
categories:
tags:
date: 2014-11-10T21:09:45+00:00
comments: false
---
Yeah, everybody hates **Public Key Infrastructure (PKI)** and I get that, it increases the complexity of a project and when you have to deal with SSL most of your troubleshooting options go down the drain.
<br><br>
No wonder there's an old **"MIT Curse"** about casting PKI on an enemy team project, cause when you use it to solve a problem you'll end up having many more.

<div style="text-align:center" markdown="1">
  ![ssl](/images/ssl.png)
</div>

But when **done right** it's currently your best option for securing data exchanges over hostile environments (ex: internet, compromised networks).
<br><br>
Before proceeding any further check out the following definitions:

| :----------- | :---------- |
| **[x509](https://www.ietf.org/rfc/rfc2459)**: | Standard for Public Key Infrastructure |
| **[.csr](https://www.ietf.org/rfc/rfc2986)**: | pkcs10 |
| **.pem**: | x509 Certificate container base64 encoded (can have the full chain) |
| **.der**: | Certificate binary container |
| **.key**: | |
| **.jks**: | Java keystore or java trustore |
| **.p12**: | .pfx, .pkcs12 Container with key, cert and chain |
| **CRL**: | Certificate Revocation Lists - File with a list of all revoked certificates issued by the Certification Authority (CA) |
| **OSCP**: | Online Certificate Status Protocol - Service to check if a certain certificate is still valid |

So, why mention **"done right"** before? Glad you ask, let me explain.<br>
Starting from the assumption (yeah, the mother of all fsckups) you're going to use client side SSL on your app, you'll need a trustore to validate the remote server certificate. So, the question right now is:
<br><br>
- Do you know which CAs you currently have on your truststore and what is the **certification chain** needed for the target certificate so it validates successfuly?
<br><br>
If any of the above answers is **NO**, you're doing it wrong! You should only use Root CAs you trust and nothing else, why maintain several CAs that you don't care about and could end up being compromised?
By now you might realised I'm talking about the standard Java `cacerts` file, and this message is for all of you who use old Java versions and with it old cacerts truststores. Do a favor to yourself and create your own truststores, specifically for your project.
<br><br>
What the hell is a certificate chain and why should I care? Once again, good question.
When you buy a certificate, usually its not sign directly by a Root CA, instead its sign by a CA which it's sign by a higher CA and so one until it reaches the Root CA, here's an example:

<div style="text-align:center" markdown="1">
  ![ssl](/images/google_chain.png)
</div>

As you can see, the wildcard certificate for google.com has two more intermediate CAs before the Root CA. If your truststore doesn't have all the intermediate CAs you won't be able build the certificate chain validate the certificate.
<br><br>
And how do you garantee that a certificate from a certain CA is exactly the one you are expecting and not a random certificate from that CA?
Well, a certificate as several fields, including hashes, usually the CN is used for validation.
Hashes will change if the certificate is renew and you'll don't know when that's going to happen.

How do I know if a certificate has been revoked?
There're two main mechanisms for that, CRL and OCSP

* Hostname validation (server certificates)
* Continuously validating the certificate
  * CRL
  * OSCP
* key (pass/no pass) beware the cost

<br><br>
I'm just a padawan on the ways of PKI and obviously this post is **not** <i>"everything you wanted to know about PKI and were afraid to ask"</i>, but I hope it kicks you into the rabbit hole.
<br><br>
As a final note:
Never, ever, never share your private key! <- Was that clear enough?
