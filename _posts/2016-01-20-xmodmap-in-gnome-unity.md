---
layout: post
title: Using xmodmap within GNOME (and Unity)
tags: desktop gnome
---

TL;DR `~/.Xmodmap` is obsolete and doesn't work within GNOME/Unity. <del>You
have to apply it via *hotplug command* of *gnome-settings-daemon*.</del> Work
it around with `.desktop` file placed in autostart directory.

---

I use the `xmodmap` command to modify layout of my keyboard (Caps Lock as Esc
is great for vimists).
At first, I thought I'd just create a [`~/.Xmodmap`][gh] file and it'd work for
me.
I didn't do the research across desktop environments and graphical servers,
however, it seems to work on KDE in openSUSE.
On the other hand, Unity (Ubuntu) and GNOME (openSUSE) doesn't apply settings
from this file and I had to execute `xmodmap ~/.Xmodmap` manually after each
reboot.
What is worse it did even happen after suspend and wake up, which is annoying.

The cause for this is the *gnome-settings-daemon* and its keyboard plugin that
handles keyboard layouts.
The *gnome-settings-daemon* overrides any `xmodmap` settings you may
create, e.g. after suspend-wake up cycle.
Secondly, it deliberately ignores `~/.Xmodmap` file ([reasoning][nx]).

I think the proper solution for this would be to **create a custom layout** and
use that with your favorite key mappings. However, I didn't pursue this and it
may worth a future try.

The *gnome-settings-daemon* and it's plugin allows you to **specify a hotplug
action** which is executed when the device is discovered. In order to use this
just do following.

{% highlight bash %}
# cat /etc/hotplug-command.sh
#!/bin/bash

sleep 5
xmodmap $HOME/.Xmodmap
{% endhighlight %}

{% highlight bash %}
gsettings set org.gnome.settings-daemon.peripherals.input-devices \
        hotplug-command /etc/hotplug-command.sh
{% endhighlight %}

Little note about the hotplug script.
It is triggered for each in put device (which should be at least a mouse and a
keyboard), see [what arguments][hot] it gets.
Fortunately, my variant is idempotent and so I don't handle any args.
Further, the script is invoked for mouse only (to be more precise it's
[implemented][fix] for adding/removing keyboards only, not present)
and there is a race with keyboard layout configuration by *g-s-d* itself.
That's why the `sleep 5` is used.

## Update since gnome-settings-daemon 3.19.5

Newer versions of gnome-settings-daemon [don't support hotplug commands][rm]
anymore (since [c50ceb880][c50], released in 3.19.5).

Simple workaround with systemd user service doesn't work as it can't properly
connect to X server. (`xmodmap: unable to open display ':0'`).

Ugly yet easy solution is creation of `~/.config/autostart/xmodmap.desktop`
file wrapping the xmodmap script

{% highlight ini %}
[Desktop Entry]
Encoding=UTF-8
Name=xmodmap modify keyboard layout
Exec=/etc/hotplug-command.sh 
Type=Application
Categories=System;
StartupNotify=true
{% endhighlight %}

Such an "application" will be started on GNOME session startup. Alas it fails
to modify keyboard layout when you switch between users or resume from suspend
(AFAIK *gnome-settings-daemon* will overwrite your modifications with keyboard
layout).

[gh]: https://github.com/Werkov/dotfiles/blob/master/.Xmodmap
[nx]: https://bugzilla.gnome.org/show_bug.cgi?id=674874
[hot]: https://github.com/GNOME/gnome-settings-daemon/blob/9287ef9ac5b119abdcbbabd920c19f353e577f90/plugins/common/input-device-example.sh
[fix]: https://bugzilla.gnome.org/show_bug.cgi?id=674221
[rm]: https://bugzilla.gnome.org/show_bug.cgi?id=759599
[c50]: https://github.com/GNOME/gnome-settings-daemon/commit/c50ceb880e928506d987747f9e554079ad3d9826
