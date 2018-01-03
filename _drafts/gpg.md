---
layout: post
title: GPG identity crisis
tags: GPG certificate trust
---

- identity
  - physical person
  - organization
  - group
  - machine

- identity in context of society (Keybase.io)
- only agent can <del>have identity</del> be trusted
  - delegation of own responsibilities/powers
  - acting on behalf
- agent examples
  - physical person (brain, senses, actuators, personality)
  - organization
  - group
  - machine (time source, banking machine)
  - program
- agent's reality
  - depends on agents acting power

- identity
  - text (number) representation of agent (for purposes of messaging)
  - it must uniquely identify the agent
    - 1) in the scope of trustor (TODO)
      - I don't need UIDs, I can just 
        - check with a person/board/representative physically, "Yes, key <whole key> is the key I use for signing/encryption."
	- machine: check that machine has stored the key inside
	- check the program storage (memory, disk, ...(all at the ultimate level))
      - this works well if I don't need transitive trust
    - 2) globally/locally by set of actions)
      - I know (ultimately trust) that only X can perform action A
      - set of actions can carry information (e.g. binary number $\langle A_i \rangle$)
        - person X wears a red T-shirt 
	- organization: organizes an event
	- machine: sends my money
	- program: touches a file
      - if I don't trust ultimately I can combine various action "channels" and
	trust probalistically
	- action results as perceived by the trustor
	- principle of keybase.io
  - transitive trust
    - vocab: trust goes from originator to trustor
      - the best would be to attach the agent itself in the certificate
    - a) trustor knows the agent (agent's reality)
      - they can check themselves or by the set of actions, i.e. this is no difference from local trust
    - b) trustor doesn't know the agent (agent's reality)
      - unsolvable (this is the identity crisis)
      - originator can only pass imprint of perceived actions 
        - person who wears a red T-shirt, person who writes these tweets
	- person who reads this mailbox and use this From: header
	- person with Birth ID #### (this may identify but it's completely useless for the trustor)
	- machine that sends my money (if I know we use the same machine, then in also sends my money)



- certificate
  - "This key pair belongs to <X>"
    - consequences
      - E: only X can read messages (secrecy)
      - S: message originates from X (authenticity)
    - X is identity
  - message wasn't changed (tampered) on the way (integrity)
- problems
  - MITM
  - hash collisions
  - brute force attacks
  - birthday paradox (what if same keys, just randomly)
  - side channels (lousy application, keyloggers)
  - end point
- use cases
  - private communication (don't want to leak on the way)
    - no need for trust
  - starting a revolution
    - "Coup starts at 7 PM" -- don't want to send such a message to
      contrarevolution agent Y
    - Y acts as it was X
  - installing software
    - I trust X and want allow it to access my machine (data)
    - Y spoofs own content (own signature)
  - operating with a shared resource (spending Bitcoins)

- to trust a key pair := trust a self-signed certificate
- there exists threshold where trust is ultimate
  - own senses, raw physical world (no illusions)

edit 2017-12-10: https://aliceevebob.com/2017/05/09/what-is-trust-with-apologies-to-pontius-pilate/

===========

- Golčův Jeníkov--město		18:15	18:24
- Světlá n/S. 			18:39	18:47
- Havlíčkův Brod		19:00	19:06
