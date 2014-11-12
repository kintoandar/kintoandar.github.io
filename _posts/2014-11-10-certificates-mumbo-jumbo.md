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

However, when **done right**, PKI is currently the best option for securing data exchanges over hostile environments (ex: internet, compromised networks).

> So, why did I mention **"done right"** in the previous sentence?

Because most of the time this happens:

<div style="text-align:center" markdown="1">
  ![no idea](/images/no_idea.jpg)
</div>

If you're reading this post/rant you're probably using client side SSL on your app, so...

> Do you know which CAs you currently have on your truststore and what is the **certification chain** needed for the target certificate so it validates successfuly?

If the answer is **NO**, you're doing it wrong! You should only use Root CAs you trust and nothing else. Why maintain several CAs that you don't care about and that could end up being compromised?
Yeah, I'm talking about the standard Java `cacerts` file and this message is for all of you who use old Java versions and with it, old `cacerts` truststores. Do yourself a favor and create your own truststores, specifically for your project.

> What da hell is a certificate chain and why should I care?

When you buy a digital certificate, usually it's not signed directly by a Root CA. Instead, it's signed by an intermediate CA, which by its turn is signed by a higher CA, and so one, until it reaches the Root. This is called the certificate chain. Here's an example:

<div style="text-align:center" markdown="1">
  ![ssl](/images/google_chain.png)
</div>

As you can see, the wildcard certificate for google.com has two more intermediate CAs before the Root CA. So, answering the question above, if your truststore doesn't have all the intermediate CAs you won't be able build the certificate chain and the certificate won't be successfully validated.

> How to guarantee that a certificate from a certain CA is exactly the one I'm expecting and not a random one from the same CA?

Well, a certificate has several fields that you can check against, for example, the fingerprint or the Common Name (CN). Be advise that when you use the fingerprint, if the certificate is renewed, you'll need to update your validation scheme.

> How do I check if a certificate as been revoked by a CA?

There're two mechanisms for that, **Certificate Revocation Lists** (CRL) and **Online Certificate Status Protocol** (OCSP):

*  **CRL** - File with a list of all revoked certificates issued by the Certification Authority (CA)
*  **OSCP** - Service to check if a certain certificate is still valid

> A higher key size, like 4096 bits, is always better, right?

Security wise, definitely! But there's a price to pay. It will have an impact in the performance of your server due to the cryptographic operations it has to perform. So, a key size of 2048 bits will be your best choice right now, lower than that it will be refused by some servers.
<br><br>
_In conclusion..._
<br><br>
Please keep in mind that you should **never, ever, <u>ever</u> share your private key!** I've heard the most ludicrous reasons for getting a hold on a private key, and the answer should always be: **- NO WAY IN HELL!**
<br><br>
TALK ABOUT PKI

---

Time for some useful commands, but before proceeding any further, check out the following definitions:

*  **[x509](https://www.ietf.org/rfc/rfc2459)** - Standard for Public Key Infrastructure
*  **[.csr](https://www.ietf.org/rfc/rfc2986)** - pkcs10
*  **.pem** - x509 Certificate container base64 encoded
*  **.der** - x509 Certificate container binary encoded
*  **.key** - It's used for creating the .csr
*  **.jks** - Java keystore or java trustore
*  **.p12** - Is a binary container with key, certificates and even chains (AKA .pfx or pkcs12)

```javascript
<% ad f %>
sh run cenas
ls bla bla
fdisk
```



I'm just a Padawan on the ways of PKI and obviously this post is **not** _"everything you wanted to know about PKI and were afraid to ask"_, but I hope it kicks you down the rabbit hole.
