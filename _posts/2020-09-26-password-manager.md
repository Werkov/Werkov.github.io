---
layout: post
title: How to choose password manager?
tags: ['security', 'flowchart', 'personal computing']
---

## TL;DR

(Some recent updates not incorporated, see the last section below.)

![Password manager flowchart](/resources/2020-09-26-pwman-flowchart.png)


## Some aspects of password managers

 * Master password (PC: Primary password)
   * 2FA
   * What to protect
   * Phishing
   * Passphrase
   * Timeout lock, shared device
 * Password manager
   * Integration: browser, API clients?, phone
   * Storage: local, remote
   * Separated profiles (unique masters)
   * Ownership of the device used (backups)
 * Password generator
   * Secure password - entropy
   * Passphrase
 * Exotic features
   * Family shared accounts
   * Cross domain sharing (SSO)
 * Convenience x security tradeoff
   * Process separation
   * Quality of the implementation of the extension
 * Can you completely wipe your account?

## Threat model

  * personal computing: too many passwords, password reuse
  * authetication provider leaks
  * phishing via browser

## Solutions

 * Paper sticker
   * domain name match (phishing)
 * KeePassXC (not KeePassX, also not KeePass)
   * Desktop storage, integration with browsers
     * Needs browser plugin?
   * Advanced features (TOTP)
   * Not on phone
   * Sharing via DropBox et al.
     * <del>or KeeShare</del>
 * Firefox Lockwise
   * Android client, better integrated with FF browser though
   * Database inaccessible with other browser
   * Key derivation [weakness](https://palant.info/2018/03/10/master-password-in-firefox-or-thunderbird-do-not-bother/)
     * TODO check how it is now and how the migration happens
   * Master password vs FF sync password (and default emptiness)
 * Lastpass
   * Track of record with controversies
   * Good enough (surveillance)
 * Dashlane
   * Free version doesn’t extend to multiple devices
 * Chrome
   * Unencrypted remote storage?
   * Destructive sync?
 * MS Windows Credential Manager ~ Edge built-in
 * Bitwarden
   * Looks like sharing counterpart of KeePassXC
   * It’s open source *and* backed by a company

## Update 2021-12-11

  * not evaluated multi-factor authentication (MFA), HW tokens (FIDO2)
  * not evaluated [pass](https://www.passwordstore.org/) (as KeePassXC alternative)
  * should check the current track record of the proposed solutions
  * shared devices
    * as long as user separation is reliable and admin trustworthy, it's no difference
  * public (untrusted) devices
    * keyloggers
    * solvable by HW tokens/MFA?

