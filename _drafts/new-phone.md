---
layout: post
title: New phone
tags: purchase
---


## Requirements

- built-in (old school phone)
  - SMS client
  - alarm clock
  - (synchronized) clock
  - (offline) map
  - stopwatch
  - music player
  - (occasional) camera
  - calendar notifications/reminders
  - (occasional) web browsing
- applications
  - sleep log
  - AnkiDroid
  - dictionary
- non-functional
  - work in freezing cold environment
  - compact size (running)

## Market research

- Firefox OS -- discontinued
- [Replikant](http://www.replicant.us/) -- supported devices not sold
- Sailfish OS (Jolla phone)
  - obsolete, not-available in Czechia
- <del>CyanogenMod</del> LineageOS
  - not-fully free, but large list of compatible devices
  - viable option (
- Android
  - non-free, too dominant easy target (security by exlusivity)
- Windows
  - non-free
- Rim OS (Blackberry)
  - non-free


## Concerns

- what to do with the old phone?

## Moving to a new phone

- backup the old phone
  - contacts
    - Google/Samsung account sync
  - multimedia (photos)
    - yet another Samsung account sync possibility
    - photos were saved on the SD card
  - application data & accounts
    - Jami
      - master password, forgotten
  - vendor's ROM
  - provided solutions
    a) Samsung account
    b) Google account
      - not possible to get the data to PC
        - https://support.google.com/drive/thread/10677850/downloading-phone-s-backups-from-google-drive-to-pc-or-alternative-phone?hl=en
      - which of the multiple accounts on the phone do I use?
    c) Samsung Smart Switch agent
      - it has its own ToS
  - big question: where are the data stored?
    - internal storage
    - SD card

log:
[root@blackbox-arch ~]# pacman -S android-file-transfer
[root@blackbox-arch ~]# pacman -S heimdall


### 2021-08-16

- attempted twrp saving in download mode
- blocked by FRP lock (factory reset protection)
- issued factory reset from GUI
- multiple wipes and format data in twrp menu (typing yes)
  - backup didn't work
- sideload menu, nothing special
- adb sideload
- adb reboot

- broken display works better with 0% or 100% brightness
- LineageOS
  - can't find any apps
  - camera doesn't fire the flash
  - always on shows gray background
  - 17.1 is Android 10, still based on kernel 3.18 and vendor security patch level is still Dec 2020
  - font anti-aliasing is blurry (or is it the display?)
  - can't see how to install any app
    - downloaded f-droid but can't find it in file manager
    - gesture is upward swipe
  - the offer on F-droid is limited, no mapy.cz
    - will internetbanking work?
  - camera app is very simple, no panorama or customizations
  - new androi is much more configurable
  - built-in browser has windows instead of tabs
  - Fennec browser is noticebly slow (not smooth)

## 2021-09-02

- upgrading to 18.1
- USB debugging enabling again, will show in `adb devices`
- 5210c23de2c93469        device
- updated to 18.1
- playing with `adb shell`
  - despite root adb debug mode (in dev options)
  - I'm getting uid 2000
  - I have to restart adb daemon, `adb root`
  - how to fix backlight bars
    - https://stackoverflow.com/questions/59725317/how-to-determine-current-amoled-screen-mode
- TODO use some tracing (raw_sys_enter?) to figure out what causes the lockscreen blink and try fiddling with associated attributes
- TODO capture a video of broken backlight and ask on channels
- a5y17lte:/sys # echo -15 >./devices/14800000.dsim/lcd/panel/temperature
  - seems to fix it (allows higher brightness but black is still not black)
    - actually, I'm not sure if stock ROM achieved full black, may be only visible at night
- drivers/video/fbdev/exynos/decon_7880/panels/s6e3fa3_a5y17_param.h:NORMAL_TEMPERATURE
  - the dsim driver is for a7 (which has different display)
  - but configs are alright
  # CONFIG_PANEL_S6E3FA3_A7Y17 is not set
  CONFIG_PANEL_S6E3FA3_A5Y17=y
  s6e3fa3 vs s6e3fa5

## 2021-09-04
- comparing with stock kernel
  - can't run `adb root` on production build :-(
- trying the sources of Android
  - alas, the good AOD implementatin is likely from samsung and can't get that :-/

- /sys/devices/14800000.dsim
  - this is the main access to the panel/lcd/backlight
  - /sys/devices/14800000.dsim/backlight/panel
    - setting brightess
  - /sys/devices/14800000.dsim/lcd/panel
    - setting temperature

- what is the origin of the kernel source, the android source
  - the kernel has commit message with just "A720SKSU3CSH1"
    - leads to some shady website for downloading stock ROM
    - https://opensource.samsung.com/ doesn't have any relevant content
      - the search is egregious
      - download speed is slow, 50 kB/s
    - I take that back, samsung provides full kernel sources, although I'm not sure there are the latest updates
  - download of lineage os repos is so long... 

- random fact, Samsung uses Jack for audio?
