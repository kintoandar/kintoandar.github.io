---
title: "PTCoreSec - Because Security Matters"
excerpt: "Published awarded article on security research using hashcat and benchmarking several hashing mechanisms."
header:
  teaser: /images/ptcoresec.png
  og_image: /images/ptcoresec.png
tags:
  - community
  - security
---

![ptcoresec](/images/ptcoresec.png){: .align-center}

For a year now, I've been a member of a Portuguese security research group named [PTCoreSec](http://ptcoresec.eu/). It all started as a way to give something back to the infosec community. 
As you probably have noticed I really don't have much time to keep this blog flowing with regular posts, but I've gathered the time I could to help PTcoreSec, which I believe provides help and education about information security problems to professionals and the common citizen alike, and that's something to be **proud** of. Besides, the team is just amazing and the fun never ends!

I contribute to the team with the blog posts I write, worked in a couple of Capture the Flag challenges for the 2012 [Just4Meeting](http://www.just4meeting.com/2012/index.html), in particular one I'm very proud of, but perhaps I'll write a post about that. I've also been invited to write an article for a [Portuguese online technology magazine](http://www.revista-programar.info/), curious enough it coincided with a new box I've assembled with a state of the art graphics card. 

As I'm keen on password auditing, I've choosen this topic for the article. Giving a quick intro about hashes, salt and cracking techniques, and with the help of @synchroack, we've benchmarked [hashcat](http://hashcat.net/) against md5, sha1, sha256, sha512 and md5 + salt via GPU and via CPU. 

![ptcoresec](/images/pap.jpg){: .align-right}
Besides the outstanding results, this article also provides all the information needed to successfully audit passwords on a relatively cheap hardware configuration.
Curious enough, our article was voted the best of that edition and here's the prize T-Shirt to prove it :)

You can find the magazine below, but I must warn you it's written in Portuguese, nonetheless the benchmark data speaks for itself and any question you may have feel free to ask me, I'll gladly help.  

[Get the magazine](/images/Revista_PROGRAMAR_37.pdf){: .btn .btn--info}
