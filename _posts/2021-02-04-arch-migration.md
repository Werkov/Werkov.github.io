---
layout: post
title: Migration to Arch
tags: Linux desktop sysadmin Arch Ubuntu
---

## Choice of distribution

* rolling updates -- after few years of using openSUSE Tumbleweed I learnt it's
  possible to use rolling updates distro on daily machine without any major
  breakage and the possibility to use almost upstream versions is just so
  appealing.
* customizations -- my old Ubuntu system was already customized (root on RAID,
  i3) and I didn't use any of the Ubuntu fads (UI, snaps (actually those scared
  me away)), I just needed a distro that supplies updates to the packages that I
  use.
* I ruled out Gentoo because of its environmental impact and [weirdo
  aura](https://web.archive.org/web/20060903005300/http://funroll-loops.org/)
  it has.
* I considered exploring non-RPM non-DEB world after years on such systems
  (otherwise openSUSE Tumbleweed or Debian Testing would satisfy my needs).

## Archwiki

  * It is well known even to non-Arch linux users thanks to its curated and
    applicable content.
  * When I installed Arch on my machine, I realized the reason -- the wiki
    substitutes an [installer and setup tool](https://yast.opensuse.org/),
    those don't exist in Arch
    ([almost](https://man.archlinux.org/man/pacstrap.8)).
  * At some moments (e.g. mariadb) the wiki also substitutes post-install scripts.
  * This allows high customizations of every Arch install.

## Moving without changing /home

  * unison worked (despite I upgraded from 2.48 to 2.51 the on-disk format still matched and sync worked)
  * fortunately, pulseaudio files are distinguished with a UUID prefix
  * FF profile got upgraded, i.e. works only one-way

## Misc

  * I learnt about Xresources -- yet another example of history cycles and
    evolution in SW ecology (cf. settings in each GNOME/KDE application).
  * It's so systemd positive (networkd, timesyncd,...).
  * non-empty root password (and no sudo by default)
  * AUR packages -- this is unlike Ubuntu's PPAs or openSUSE's home repos, it's
    like nested Gentoo

## Dislikes
 
  * very brief package changelogs (if any), OTOH, they are kept in git
  * unclear semantics of `optdepends` dependency
  * gnu-free-fonts can't be watched (too thin, weirdly blurred antialiasing)
    * helpful [calibration image](http://www.lagom.nl/lcd-test/subpixel.php)

## October 2021 update

  * no debuginfo, need to rebuild packages with debuginfo flag (I can't just download debuginfo)
  * OTOH, fix (for a severe memory corruptino bug) was already commited when I
    started dealing with it

## Feb 2023 update
  
  * /lib/modules/$(uname -r)/ may be empty after kernel update AND NO reboot
    * that sucks for lazily loaded modules
