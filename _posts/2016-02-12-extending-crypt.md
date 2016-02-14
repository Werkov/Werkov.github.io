---
layout: post
title: Extending filesystem on encrypted loopdevice
tags: sysadmin
---

Great source if of course [Archwiki][arch], however, my openSUSE
system uses encrypted keyfiles and pam_mount so manual decryption of the
keyfile is necessary.

{% highlight bash %}
# Assume there are these files:
# /home/user.img    -- loopdevice backing file
# /home/user.key    -- encrypted key file
# /home/user        -- directory where encrypted FS is mounted

# First unmount the filesystem and close LUKS device
umount /home/user
cryptsetup luksClose <device name>

# expand backing file, urandom gives ~12 MB/s
dd if=/dev/urandom bs=1M count=<size> | cat - >>/home/user.img

# use fskeycipher for cypher type (in /etc/security/pam_mount.conf.xml)
openssl -d aes256 -in /home/user.key -out /tmp/user.plainkey

cryptsetup --key-file=/tmp/user.plainkey --type luks open /dev/loop0 foobar
cryptsetup resize foobar

blkid /dev/mapper/foobar
e2fsck -fv /dev/mapper/foobar
resize2fs -p /dev/mapper/foobar

shred -u /tmp/user.plainkey
# Complete :-)
{% endhighlight %}

[arch]: https://wiki.archlinux.org/index.php/Dm-crypt/Encrypting_a_non-root_file_system#Resizing_the_loopback_filesystem
