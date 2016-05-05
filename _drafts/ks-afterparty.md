---
title: Key signing afterparty
layout: post
tags: PGP, security
---

Consequence of my previous [visit of Bruxelles]({% post_url
2016-01-31-fosdem.md %}) is actual signing and publishing the signature from
the key signing party.

## Signing

I used utility [caff](https://wiki.debian.org/caff) that is part of package
`signing-party` in openSUSE distribution (and similarly in Debian based).

I was surprised caff is able to process list of participants from the
keysigning party transparently, I just have to retype marks from the paper into
[the text file](https://ksp.fosdem.org/files/ksp-fosdem2016.txt).

{% highlight bash %}
caff <key id> <ksp-fosdem2016.txt
{% endhighlight %}

Unfortunately, Perl modules for SMTP that caff uses were not able to
communicate with my SMTP server over TLS and I have to configure local proxy
(MTA) postfix.

The basic settings were:
TODO

## Publishing

I received my identities signed by e-mails from other participants (which is
preferable to publishing signatures directly to servers, it guarantees
recipient is able to decrypt the signatures). 

My mailbox (I should rather say maildir) was full of such encrypted e-mails
that I didn't want to process manually one by one this I used following
snippet:

{% highlight bash %}
# in this directory signature mails are stored (copied from maildir)
WRK=$PWD/wrk

# here will be GPG signature files
OUT=output

ripmime -i "$1" -d $WRK

gpg --decrypt <$WRK/msg.asc >$WRK/foo.msg
ripmime -i $WRK/foo.msg -d $OUT

rm $WRK/*
{% endhighlight %}

In the end, I had to import the signatures to my keyring and publish it:

TODO
