---
title: "IRSSI IRC mention notify by email using ssmtp"
excerpt: "Still using IRC? Follow this tutorial to get notifications from IRC on your inbox using ssmtp."
header:
  teaser: /images/irssi.png
  og_image: /images/irssi.png
tags:
  - linux
  - automation
  - howto
---

![irssi](/images/irssi.png){: .align-center}

I've always been a huge fan of [IRSSI](http://www.irssi.org/) client, the provided simplicity and customisation are a major benefit for all IRC users out there.

As it runs inside screen and is designed for permanent availability without downtimes, it's easy to forget to check it for new messages on the connected channels. After looking for something to keep track of my nickname mentions I've found fnotify to be a good candidate to remember me to check for new messages. But fnotify only logs nick mentions to a text file, so I've "improved" it to send a email so that I could always be warned when someone tries to talk to me.

Here is a small modification I've made to the fnotify plugin so it may notify me by email every time my nickname is mentioned on a channel.
It uses [ssmtp](https://www.linux.com/news/ssmtp-simple-alternative-sendmail) to send email through gmail.

You only have to set 2 variables on the script:
* `$EMAIL` - Your notify email address
* `$SSMTP` - The path to the ssmtp client

{% highlight bash %}
[user@gambit ~]$ cat .irssi/scripts/autorun/fnotify.pl
{% endhighlight %}

{% highlight bash %}
use strict;
use vars qw($VERSION %IRSSI);

use Irssi;
$VERSION = '0.0.3';
%IRSSI = (
	authors     => 'Joel Bastos,Thorsten Leemhuis',
	contact     => 'fedora@leemhuis.info',
	name        => 'fnotify',
	description => 'Write a notification to a file and send it by email showing who is talking to you in which channel.',
	url         => 'http://www.leemhuis.info/files/fnotify/',
	license     => 'GNU General Public License',
	changed     => '$Date: 2007-01-13 12:00:00 +0100 (Sat, 13 Jan 2007) $'
);

#--------------------------------------------------------------------
# In parts based on knotify.pl 0.1.1 by Hugo Haas
# http://larve.net/people/hugo/2005/01/knotify.pl
# which is based on osd.pl 0.3.3 by Jeroen Coekaerts, Koenraad Heijlen
# http://www.irssi.org/scripts/scripts/osd.pl
#
# Other parts based on notify.pl from Luke Macken
# http://fedora.feedjack.org/user/918/
#
# ssmtp email notification support added by Joel Bastos
# http://blog.kintoandar.com
#
#--------------------------------------------------------------------

# !! Please set the variables (don't forget to escape "\" the "@" symbol like de example) !!
my $EMAIL = "YourUserName\@gmail.com";
my $SSMTP = "/usr/sbin/sendmail";

#--------------------------------------------------------------------
# Private message parsing
#--------------------------------------------------------------------

sub priv_msg {
	my ($server,$msg,$nick,$address,$target) = @_;
	filewrite($nick." " .$msg );
}

#--------------------------------------------------------------------
# Printing hilight's
#--------------------------------------------------------------------

sub hilight {
    my ($dest, $text, $stripped) = @_;
    if ($dest->{level} & MSGLEVEL_HILIGHT) {
	filewrite($dest->{target}. " " .$stripped );
    }
}

#--------------------------------------------------------------------
# The actual printing
#--------------------------------------------------------------------

sub filewrite {
	my ($text) = @_;
	# FIXME: there is probably a better way to get the irssi-dir...
	my $date = `date` ;
        open(FILE,">>$ENV{HOME}/.irssi/fnotify");
	print FILE $date . $text . "\n\n";
        close (FILE);
	my $mail=`echo "Subject: IRSSI"|cat - $ENV{HOME}/.irssi/fnotify|$SSMTP $EMAIL`;
}

#--------------------------------------------------------------------
# Irssi::signal_add_last / Irssi::command_bind
#--------------------------------------------------------------------

Irssi::signal_add_last("message private", "priv_msg");
Irssi::signal_add_last("print text", "hilight");
{% endhighlight %}

[Get it on GitHub](https://github.com/kintoandar/shell_scripts/blob/master/plugins/fnotify.pl){: .btn .btn--info}
