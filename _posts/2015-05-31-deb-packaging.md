---
layout: post
---

====== Debian packaging ======

<file bash>
mkdir deb
cd deb
mkdir debian
mkdir sources
cd debian
touch changelog control rules 
</file>

The last line is important, you need to fill correct data to these files. [[http://askubuntu.com/questions/166244/packaging-a-cmake-project-librocket-into-a-deb-but-build-script-is-in-a-sub|Rules]] are simple, changelog is manually filled (needs distribution name, and fixed ''urgency=low'', control can be dummy (FIXME).

Automatically find build dependencies

    dpkg-depcheck -b debian/rules build

Build the package

    dpkg-buildpackage -S

(In order to upload it, ''-S'' option must be given.)

[[https://help.launchpad.net/Packaging/PPA/Uploading|Upload]] it to repository (e.g. Launchpad).

    dput ppa:your-lp-id/ppa <source.changes>
