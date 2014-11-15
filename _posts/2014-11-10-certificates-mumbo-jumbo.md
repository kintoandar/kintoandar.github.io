---
layout: post
title: "Certificates Mumbo Jumbo"
author: Joel Bastos
modified:
categories:
tags:
date: 2014-11-10T21:09:45+00:00
comments: true
---

#### Everybody hates PKI

<section id="table-of-contents" class="toc">
  <header>
    <h3>Index</h3>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

Yeah, everybody hates **Public Key Infrastructure (PKI)** and I get that, it increases the complexity of a project and when you have to deal with SSL most of your troubleshooting options go down the drain.
\\
\\
No wonder there's an old **"MIT Curse"** about casting PKI on an enemy team project, cause when you use it to solve a problem you'll end up having many more.

#### Secure all the things

However, when **done right**, PKI is currently the best option for securing data exchanges over hostile environments (ex: internet, compromised networks).

> So, why did I mention **"done right"** in the previous sentence?

Because most of the time this happens:

<div style="text-align:center" markdown="1">
  ![no idea](/images/no_idea.jpg)
</div>

If you're reading this post/rant you're probably using client side SSL on your app, so...

#### Who can you trust?

> Do you know which Certification Authorities you currently have on your truststore and what is the **certification chain** needed for the target certificate so it validates it successfuly?

If the answer is **NO**, you're doing it wrong! You should only use Root Certification Authorities (CA) you trust and nothing else. Why maintain several CAs that you don't care about and that could end up being compromised?
Yeah, I'm talking about the standard Java `cacerts` file and this message is for all of you who use old Java versions and, with it, old `cacerts` truststores. Do yourself a favor and create your own truststores, specifically for your project.

#### Chaining things together

> What da hell is a certificate chain and why should I care?

When you buy a digital certificate, usually it's not signed directly by a Root CA. Instead, it's signed by an intermediate CA, which by its turn is signed by a higher CA, and so one, until it reaches the Root one. This is called the certificate chain. Here's an example:

<div style="text-align:center" markdown="1">
  ![ssl](/images/google_chain.png)
</div>

As you can see, the wildcard certificate for google.com has two more intermediate CAs before the Root CA. So, answering the question above, if your truststore doesn't have all the intermediate CAs you won't be able build the certificate chain and the certificate won't be successfully validated.

#### One in a million

> How to guarantee that a certificate from a certain CA is exactly the one I'm expecting and not a random one from the same CA?

Well, a certificate has several fields that you can check against, for example, the fingerprint or the Common Name (CN). Be advised that when you use the fingerprint, if the certificate is renewed, you'll need to update your validation scheme.

#### Check it out

> How do I check if a certificate as been revoked by a CA?

There're two mechanisms for that, **Certificate Revocation Lists** (CRL) and **Online Certificate Status Protocol** (OCSP):

*  **CRL** - File with a list of all revoked certificates issued by the CA. You can find a link to download it in the CA certificate.
*  **OSCP** - Service to check if a certain certificate is still valid. If implemented by the CA, you can just query if a certain certificate issued by that CA is still valid.

#### Bigger is not always better

> A higher key size, like 4096 bits, is always better, right?

Security wise, definitely! But there's a price to pay. It will have an impact in the performance of your server due to the cryptographic operations using that key. So, a key size of 2048 bits will be your best choice right now, lower than that it will be refused by some servers.
\\
\\
**As a heads up...**
\\
\\
Please keep in mind that you should **never, ever, <u>ever</u> share your private key!** I've heard the most ludicrous reasons for getting a hold on a private key, and the answer should always be: **NO WAY IN HELL!**

---

#### Command line primer

Time for some useful commands, but before proceeding any further check out the following definitions:

*  **x509** - Public Key Infrastructure standards
*  **`.csr`** - Certificate Signing Request (also known as a pkcs10)
*  **`.der`** - Certificate container binary encoded
*  **`.pem`** - Certificate container base64 encoded
*  **`.key`** - It's just a PEM encoded file containing only the private key
*  **`.p12`** - May contain a certificate, a key and/or multiple certificates like CAs/chains (also known as .pfx or pkcs12)
*  **`.jks`** - Java keystore/trustore may contain a certificate, a key and/or multiple certificates like CAs/chains

##### Choose the Common Name
{% highlight bash %}
export DOMAIN="www.example.com"
{% endhighlight %}

##### Generate a .key
{% highlight bash %}
openssl genrsa -out $DOMAIN.key 2048
{% endhighlight %}

##### Generate a .csr
{% highlight bash %}
openssl req -new -key $DOMAIN.key -subj  "/C=PT/L=Porto/ST=Portugal/O=Epic Organization/OU=Department of Awesomeness/CN=$DOMAIN" -out $DOMAIN.csr

# show the .csr
openssl req -text -noout -verify -in $DOMAIN.csr
{% endhighlight %}

After sending the `.csr` to a CA so it may generate a new certificate, you'll eventually receive a `.pem` or `.der` file.

##### Print .pem
{% highlight bash %}
openssl x509 -in $DOMAIN.pem -text
{% endhighlight %}

##### Convert .der to .pem
{% highlight bash %}
openssl x509 -in $DOMAIN.der -inform DER -out $DOMAIN.pem -outform PEM
{% endhighlight %}

##### Convert .pem to .der
{% highlight bash %}
openssl x509 -in $DOMAIN.pem -out $DOMAIN.der -outform DER
{% endhighlight %}

##### Check .key, .pem and .csr
{% highlight bash %}
# all must share the same hash
openssl rsa -noout -modulus -in $DOMAIN.key  | openssl md5
openssl x509 -noout -modulus -in $DOMAIN.pem | openssl md5
openssl req -noout -modulus -in $DOMAIN.csr  | openssl md5
{% endhighlight %}

##### Generate .p12
{% highlight bash %}
openssl pkcs12 -export -inkey $DOMAIN.key -in $DOMAIN.pem -out $DOMAIN.p12
{% endhighlight %}

##### Extract .key and .pem from .p12
{% highlight bash %}
# .pem
openssl pkcs12 -in $DOMAIN.p12 -out $DOMAIN.pem -nokeys -clcerts

# .key
openssl pkcs12 -in $DOMAIN.p12 -out $DOMAIN.key -nocerts
{% endhighlight %}

##### Convert .jks to .p12
{% highlight bash %}
keytool -importkeystore -deststorepass "VeryStrongPass" -destkeypass "VeryStrongPass" -destkeystore $DOMAIN.jks -srckeystore $DOMAIN.p12 -srcstoretype PKCS12 -srcstorepass "VeryStrongPass" -alias 1
{% endhighlight %}

##### Convert .p12 to .jks
{% highlight bash %}
keytool -importkeystore -srckeystore $DOMAIN.jks -destkeystore $DOMAIN.p12 -srcstoretype JKS -deststoretype PKCS12 -srcstorepass "VeryStrongPass" -deststorepass "VeryStrongPass" -srcalias 1 -destalias 1 -srckeypass "VeryStrongPass" -destkeypass "VeryStrongPass" -noprompt
{% endhighlight %}

##### List .p12 certificates
{% highlight bash %}
openssl pkcs12 -info -in $DOMAIN.jks
{% endhighlight %}

##### List .jks certificates
{% highlight bash %}
keytool -list -v -keystore $DOMAIN.jks
{% endhighlight %}

##### Get full certificate chain from a webserver
{% highlight bash %}
openssl s_client -connect $DOMAIN:443
{% endhighlight %}

<br><br>

#### May the PKI be with you

I'm just a _Padawan_ on the ways of PKI and obviously this post is **not** _"everything you wanted to know about PKI and were afraid to ask"_, but I sincerely hope it kicks you down the rabbit hole.
\\
\\
Have fun!
