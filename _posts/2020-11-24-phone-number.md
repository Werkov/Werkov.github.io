---
layout: post
title: Phone number abuse
tags: musing gsm number
---

This is an exercise trying to come up with possible attack an adversary could
carry out with knowledge of person's (cell)phone number, additionally obtained
through a forced call. Other information available about the person are
deliberately unspecified.

*Motivation story: Random guy stops you in the street asking whether they can
use your phone. They claim they came to visit a friend in a nearby building but
they need to call them to announce themselves. They are fine with you holding
your device on loudspeaker and they tell you the number to call. The other side
is ringing but it is not answering the call. "Nevermind," they say, thank you
and off you go.*

## Spam

  * The number can become target of SMS or call spam.
  * Benefit to the adversary is unclear.

## Registrations

  * The number can be used for registration in various services that require phone number.
  * The service would need "only" a call to verify the entered number.
    * For instance [Signal allows](https://support.signal.org/hc/en-us/articles/360007318691-Register-a-phone-number)
      registration of a phone number by a call only but the verification code
      needs to be transferred.
  * It's possible that the adversary could use a service (with wrong
    authentication design) in limited extent or for limited time.

## Stalking

  * The number could be used as a search key in various databases and stalk the
    actual holder.

## Phishing

  * object: The holder can become victim of a phishing attack by receiving a
    message tailored in accordance with other information obtained during
    harvest.
  * subject: The attacker can pretend being the holder of the number, the
    victim would need to know the holder already.

## Personal information article

  * The phone number can be accompanied with other metadata obtained during
    harvest (location, time, appearance) and sold (see spam above).

## Eavesdropping, number spoofing in calls/SMS, other

  * not sure if mere phone number knowledge helps anything (given low
    [entropy]({% post_url 2015-10-05-payment-cards %}) of phone number itself)
    * I estimate ~27 bits according to [Czech numbering plan](https://www.ctu.cz/sites/default/files/obsah/predpisy-opatreni/cislovaci-plan-verejnych-telefonnich-siti/soubory/cislovaci-plan-verejnych-telefonnich-siti-1114435245.pdf).
  * IMEI, IMSI: should not be available to the other end of the call (citation needed)


