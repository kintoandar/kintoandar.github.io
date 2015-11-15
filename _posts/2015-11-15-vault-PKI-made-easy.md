---
layout: post
title: "Vault: PKI Made Easy"
excerpt: "A test drive of Vault PKI backend"
author: Joel Bastos
modified: 2015-11-15
tags:
comments: true
image:
  thumb: vault.png
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

#### Disclamer
Well, not quite **PKI Made Easy**, but definitely a bit more **fun**!  
I've done all this work on OSX, but I believe the Linux setup should be very similar.

----

#### Containerize all the things
Last week I was tinkering with Docker and wanted to get Hashicorp Vault running on a container, this was mainly a plan to trick myself into learning more about Vault.  
<br>
The Docker stuff went pretty well and you have available a public container to prove it, check it out at:
<br><br>
[hashicorp-vault on a container](https://hub.docker.com/r/kintoandar/hashicorp-vault/)
<br><br>
Regarding the plan, it worked flawlessly and I've got really interested in the application.  

----

#### So, what's Vault?

<div style="text-align:center" markdown="1">
![vault_logo](/images/vault.png)
</div>

> Vault secures, stores, and tightly controls access to tokens, passwords, certificates, API keys, and other secrets in modern computing. Vault handles leasing, key revocation, key rolling, and auditing. Vault presents a unified API to access multiple backends: HSMs, AWS IAM, SQL databases, raw key/value, and more.
[(source)](https://vaultproject.io/)

I'm not going into depth about how the application works and all the features it provides, firstly because I just started playing with it and secondly the [documentation](https://vaultproject.io/docs/index.html) does a very good job on that.
Instead I'll talk about what I've learned regarding the PKI backend configuration and usage.
<br><br>
These are the points I'll cover: 

*  Install Vault
*  Configure Vault
*  Generate a Root Certification Authority (CA) and Intermediate CA
*  Create a PKI backend
*  Configure the PKI backend
*  Issue a couple of server certificates
*  Issue a Certificate Revocation List (CRL) on Vault
*  Revoke a certificate
*  Vault using TLS

----

#### Setup

Create the following `vault.conf` file:
{% gist 3677aba5a14249ac499a vault.conf %}
<br>
Create and run the following setup script on the same path as the vault.conf file:

{% gist 3677aba5a14249ac499a setup.sh %}
<br>
You now should have a running instance of Vault using the `/tmp/vault/vault.conf` configuration.

----

#### Initialize Vault
{% highlight bash %}
cd /tmp/vault

vault init > credentials.txt

# check if initialized
curl http://127.0.0.1:8200/v1/sys/init

# keep your credentials safe
cat credentials.txt
{% endhighlight %}

----

#### Unseal Vault
Vault is protected by M-of-N so you'll need to run the unseal command 3 times using a different key each time to open it.

> The M of N feature provides a means by which organizations employing cryptographic modules for sensitive operations can enforce multi-person control over access to the cryptographic module. [(source)](http://cloudhsm-safenet-docs.s3.amazonaws.com/007-011136-002_lunasa_5-1_webhelp_rev-a/Content/concepts/mofn_about.htm)
{% highlight bash %}
vault unseal
{% endhighlight %}

----

#### Export the Root Token
This will authenticate your vault client against the Vault server.

{% highlight bash %}
export VAULT_TOKEN=use-your-generated-root-token
{% endhighlight %}

----

#### Check the current mount points
{% highlight bash %}
vault mounts
{% endhighlight %}

----

#### Mount the PKI backend
{% highlight bash %}
vault mount pki
vault mounts
vault path-help pki
{% endhighlight %}

----

#### Get your hands on a CA certificate
You'll need a CA for the next steps. Don't have one?  
Here you go (thank me later):
<br><br>
[dummy_ca](https://github.com/kintoandar/dummy_ca)

> You should never use a Root CA to issue client/server certificates, if it's compromised you're screwed! Instead, generate an intermediate CA and if that one it's compromised just revoke it and issue a new one.

With your certificates generated, now build a certificate bundle with the Root CA certificate, Intermediate CA certificate and Intermediate CA key.
{% highlight bash %}
export DUMMY_CA=/PATH/TO/dummy_ca

cat $DUMMY_CA/pki/intermediate/certs/intermediate.pem > \
  /tmp/vault/ca_bundle.pem

# vault does not accept encrypted keys
openssl rsa -in $DUMMY_CA/pki/intermediate/private/intermediate.key >> \
  /tmp/vault/ca_bundle.pem
{% endhighlight %}

----

#### Configure the PKI backend
Carefully read the documentation regarding the API endpoints [`/pki/config/`](https://vaultproject.io/docs/secrets/pki/index.html), [`/pki/roles`](https://vaultproject.io/docs/secrets/pki/index.html) and [`/pki/issue/`](https://vaultproject.io/docs/secrets/pki/index.html)

{% highlight bash %}
vault write pki/config/ca pem_bundle="@/tmp/vault/ca_bundle.pem"

vault write pki/roles/test-dot-local allow_any_name="true" \
  allow_subdomains="true" allow_ip_sans="true" max_ttl="420h" \
  allow_localhost="true" allow_ip_sans="true"

vault write pki/issue/test-dot-local common_name=localhost \
  alt_names="vault.test.local,*.vault.test.local" \
  ip_sans="127.0.0.1,192.168.1.77" > /tmp/vault/localhost.certs
  
vault write pki/issue/test-dot-local \
  common_name=sheep.test.local > /tmp/vault/sheep.certs
{% endhighlight %}

Split the `localhost.certs` into a separated key and certificate files:

*  `localhost.pem`
*  `localhost.key`

Split the `sheep.certs` into a separated key and certificate files:

*  `sheep.pem`
*  `sheep.key`

----

#### Test the CRL
This shouldn't return any revoked certificates yet.
{% highlight bash %}
curl -v http://127.0.0.1:8200/v1/pki/crl/pem
*   Trying 127.0.0.1...
* Connected to 127.0.0.1 (127.0.0.1) port 8200 (#0)
> GET /v1/pki/crl/pem HTTP/1.1
> Host: 127.0.0.1:8200
> User-Agent: curl/7.43.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: application/pkix-crl
< Date: Sun, 15 Nov 2015 12:14:40 GMT
< Content-Length: 0
<
* Connection #0 to host 127.0.0.1 left intact
{% endhighlight %}

----

#### Revoking a certicate
To revoke a certificate you first need its Serial Number.
{% highlight bash %}
export SHEEP_SN=$(openssl x509 -in /tmp/vault/sheep.pem -text | \
  grep -A1 "Serial Number" | grep -v "Serial Number" | \
  awk {'print $1'})
  
curl -v -X POST http://127.0.0.1:8200/v1/pki/revoke \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -d '{"serial_number":"'$SHEEP_SN'"}'
{% endhighlight %}

----

#### Test the CRL
{% highlight bash %}
curl -v http://127.0.0.1:8200/v1/pki/crl/pem > \
  /tmp/vault/crl.pem
  
openssl crl -inform PEM -in /tmp/vault/crl.pem -text
{% endhighlight %}
You should see the revoked Serial Number.

----

#### Vault with TLS
This bit took me quite a while to figure out.
<br><br>
The documentation doesn't mention how to do it.
The Vault server doesn't send the Intermediate CA certificate with the leaf certificate to the vault client, this way you can't just trust the Root CA, you'll need to trust the Intermediate one... `¯\_(ツ)_/¯`
<br><br>
I even tried providing a ca_bundle with the Root CA certificate in it, but no luck.
Then there was was the issue of finding out how to provide a truststore to the vault client...
{% highlight bash %}
# enable the truststore
export VAULT_CAPATH=$DUMMY_CA/pki/intermediate/certs/intermediate.pem
{% endhighlight %}

Uncomment the lines `tls_*_file` and comment out `tls_disable` on `vault.conf`
{% highlight bash %}
pkill vault

vault server -config="/tmp/vault/vault.conf" &

export VAULT_ADDR=https://127.0.0.1:8200

vault unseal
{% endhighlight %}

If it doesn't give you a TLS error, you're golden!
You can check the certificate the server is using and the chain if he sends it, with:

{% highlight bash %}
openssl s_client -showcerts -connect 127.0.0.1:8200
{% endhighlight %}

----

This blog post only scratches the surface of what Vault is capable of.
I'm currently looking into High Availability and there's still many other backends to try out, but I hope I've piqued your curiosity.  
<br><br>
Big thanks to [Hashicorp](https://hashicorp.com/) for releasing such amazing open source products.

 
