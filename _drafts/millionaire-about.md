---
layout: post
title: Yao's Millionaires' problem -- description
tags: cryptography programming 
hidden: true
---

See also https://blog.goodaudience.com/understanding-zero-knowledge-proofs-through-simple-examples-df673f796d99

## The ideal functionality


	                  +-----+
	         --(a)--> |     | <--(b)--
	Alice             |  F  |             Bob
	       <-(a >= b) |     | (a >= b)->
	                  +-----+

The ideal functionality accepts inputs both from Alice and Bob and then outputs
the result of comparison to each of them.
Neither Alice or Bob obtain more information from the ideal functionality.
You can think of the ideal functionality as a trusted third party.

## Real world implementation

In the real implementation Alice and Bob exchange messages between each other.
You can also imagine a [shim](https://en.wikipedia.org/wiki/Shim_(computing))
sitting between Alice and the ideal functionality translates the
messages from real world implemenation for the ideal functionality.


	      < m1   +-----+             +-----+
	        m2 > |     |   --(a)-->  |     | <--(b)--
	Alice   ...  | sim |             |  F  |             Bob
	      < mn   |     | <-(a >= b)  |     | (a >= b)->
	             +-----+             +-----+ 

The goal is that Alice cannot distinguish whether she communicates via the sim
(the *shim* is a handy typo, it is actually called simulator) with the ideal
functionality or participates in the real world implementation.
If it was possible to somehow "disassemble" the messages and learn anything
extra about Bob's secret, she could exploit that to tell the simulated and real
world apart.

(The goal applies vice versa with a simulator on Bob's side too.)

## Security models

Passive attackers (or also semi-honest) follow the real world protocol
(honestly) but they try to derive any extra information not available with the
ideal functionality.

Active attackers (malicious or byzantine) may even spoof or corrupt the
messages they exchange in the real world to reveal more than with the ideal
functionality.


## YMP solution by Ioannidis and Grama

When comparing two (same-width) numbers we can divide the digits into two
groups: decisive and non-decisive.
The decisive digits are those where the numbers differ, e.g.

	05682
	05412
	nnddn

The result of comparison is given by the most significant decisive pair.
(We will work with binary numbers in further explanation WLOG.)

The algorithm is based on the following construction (each digit has own row):

	xxxxxxx            1M
	xxxxxxx          1Mxx
	xxxxxxx        1Mxxxx <-
	xxxxxxx      1Mxxxxxx <-
	xxxxxxx    1Mxxxxxxxx
	---------------------
	xxxxxxx      1Mxxxxxx // codeword

The `x` denotes a random bit, `M` is a message bit (can be different on
different rows), 0 is a space (for readability) and 1 is `1`.
We pick only the rows representing the decisive digits (more on that later)
and sum them (bitwise) at the bottom.
The resulting codeword would preserve a *zone* of zeroes followed by `1` and a
message bit `M` -- the message bit would encode whether decisive digit was
greater in Alice's or Bob's number.

How are the decisive bits picked? Alice actually prepares two alternatives for
each digit

	decisive
	xxxxxxx        1Mxxxx
	
	non-decisive
	xxxxxxx              

and Bob picks based on *his* digit.
The pair of binary digits is decisive iff their XOR is 1.

	Bob's pick	Alice's digit	Alternative
	0		0		non-decisive
	0		1		decisive, M = 1
	1		0		decisive, M = 0
	1		1		non-decisive

Let's stop for a moment. The current proposal implies that Bob reveals all his
digits to Alice.
Conversely, if the digit is decisive, Bob can reconstruct Alice's digit by
looking at `M` in the received row alternative.

To resolve the first issue we will use a transport primitive *oblivious
transfer* (explained later) that ensures that Alice won't learn the Bob's pick.

The second issue is fixed by Alice encrypting both alternatives (using same
key) so they become undistinguishable from random noise.

Alice provides decryption key that can only be applied to whole codeword so the
decrypted codeword reveals `M` only for the most significant decisive digit,
i.e. the desired result of the comparison.

(The encryption/decryption above is plain XORing by a random key, refer to the
paper or implementation on details how codeword decryption works.)

There are two final catches.
First, Bob could try swap his pick for chosen digit and see whether the
resulting codeword changed and hence derive Alice's digit.
Another neat property of the oblivious transfer is that Bob cannot do this, he
receives the alternative for his single pick only.

Second, the position of `1M` in the resulting codeword could reveal to Bob the
order of magnitude of the difference between his and Alice's secret value.
This is easily resolved by Alice with random rotation of alternatives and
randomizing size of the random padding (denoted by random bits `y`).

	xxxxy           1M|xxx
	xxxxy         1Mxx|xxx
	xxxxy       1Mxxxx|xxx <-
	xxxxy     1Mxxxxxx|xxx <-
	xxxxy   1Mxxxxxxxx|xxx
	------------------|---
	xxxxy     1Mxxxxxx|xxx // codeword

Upon decryption, Bob cannot tell what was the original rotation (or the length
of the zone of zeroes), so he cannot reason anything about the difference of
secrets.

## Oblivious transfer




TODO lengths of codes

TODO FAQ?
