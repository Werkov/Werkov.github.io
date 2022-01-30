---
layout: post
title: Yao's Millionaires' problem – explanation
tags: cryptography programming javascript
---


This serves as explanation of the principles of the
[YMP calculator]({% post_url 2022-01-23-ymp %}), so that possible users can
more easily understand how it works and gain enough confidence to use it for
trusted two-party computation.


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

	           m1 >   
	         < m2     
	Alice      ...      Bob
	           mn >   

You can also imagine a [shim](https://en.wikipedia.org/wiki/Shim_(computing))
sitting between Alice and the ideal functionality that translates the
messages from real world implementation to the ideal functionality for Alice.


	        m1 > +-----+             +-----+
	      < m2   |     |   --(a)-->  |     | <--(b)--
	Alice   ...  | sim |             |  F  |             Bob
	        mn > |     | <-(a >= b)  |     | (a >= b)->
	             +-----+             +-----+ 

The goal is that Alice cannot distinguish whether she communicates via the sim
(the *shim* is a handy typo, it is actually called simulator) with the ideal
functionality or participates in the real world implementation.[^sim] [^sim2]
If it was possible to somehow "disassemble" the messages and learn anything
extra about Bob's secret, she could exploit that to tell the simulated and real
world apart.

[^sim]: I can't explain myself this part clearly as I didn't find consistent and
        easy to grasp definitions of de-facto standard simulation-based proofs.
        Obviously, the simulator cannot decrypt the messages from Alice to
        provide `a` to the ideal functionality.
        But it can "fake" any values tha Alice obtains from random oracles (hash
        functions) so the simulator keeps information about secrets derived by
        Alice and only that way it can decrypt and pass raw `a` to the ideal
        functionality.

[^sim2]: I'm also mixing the simulator model for oblivious transfer with more
	 complex YMP computation (that builds on top of an OT primitive) and
	 those may not compose.

(The goal applies vice versa with a simulator on Bob's side too.)

## Security models

Passive attackers (or also semi-honest) follow the real world protocol
(honestly) but they try to derive any extra information not available with the
ideal functionality.
A protocol hiding the difference between real and simulated world is immune
against such attackers.

Active attackers (malicious or byzantine) may even spoof or corrupt the
messages they exchange in the real world in an attempt to reveal more than with
the ideal functionality.
(A protocol should detect that and terminate without revealing anything more.)


## YMP solution by Ioannidis and Grama

(This attempts to be more layman approachable retelling of the [original
paper](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.110.8816).)

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
different rows), space stands for 0 and `1` is just 1.
We pick only the rows representing the decisive digits (more on that later)
and sum them (bitwise) at the bottom.
The resulting codeword would preserve a *zone* of zeroes followed by `1` and a
message bit `M` -- the message bit would encode whether decisive digit was
greater in Alice's or Bob's number.

How are the decisive bits picked? Alice actually prepares two alternatives for
each digit

	decisive
	xxxxxxx        1Mxxxx|
	
	non-decisive
	xxxxxxx              |

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
First, Bob could try to swap his pick for chosen digit and see whether the
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

### Structure of the codeword

The structure of the codeword without rotation is as follows

	   pad   |     d^2     | m  |    2*d
	11xxxxxxx|xxxxx        |    |  1Mxxxxxx
	                               <------- decisive
	               <----------------------- s
	<-------------------------------------- k

The size of the zone of zeros depends on random `s` and the highest decisive bit.
The minimum size of the zone of zeroes is `m`.
Beware that the smaller `s`, the higher probability that a false zone of zeroes
*randomly* occurs among the random bits.
Bob can detect multiple zones and the algorithm yields inconclusive result.

(You can notice a mark `11` at the beginning of the codeword. This marks serves
in the case of equal secrets of Alice and Bob.)


## Oblivious transfer

[Oblivious transfer](https://en.wikipedia.org/wiki/Oblivious_transfer) is a way
of communication when Alice sends Bob a message selected based on his input
without her learning what option Bob picked.
This can be achieved by using [one way functions](https://en.wikipedia.org/wiki/One-way_function).

High-level principle is that Bob uses the one way function to transform his selection,
Alice thus cannot easily recover his selection and she must send all messages to Bob.
To prevent Bob learning unselected messages, she encrypts the messages with a
key based both on her and Bob's secret values.
Bob is able reconstruct the key only for the message he originally picked.

I decided to implement the protocol described as [The Simplest Protocol for
OT](https://eprint.iacr.org/2015/267.pdf) with fixups from [Eduard Hauck and
Julian Loss](https://eprint.iacr.org/2017/1011.pdf).
The "quality" of the oblivion relies on the difficulty of solving the [discrete
logarithm problem](https://en.wikipedia.org/wiki/Discrete_logarithm_records) in
a group of elliptic curve points.
Refer to the linked papers for details.

## Implementation

Warning right at the beginning -- the implementation *is* rolling own crypto.
When possible, I tried to reuse existing more or less standard libs but due to
the nature of not-widely used and tried algorithms involved I had to implement
some parts myself.

The implemented composed protocol is supposed to be secure under the semi-honest participants.
**Remember, there is no guarantee the implementation attains this model.**

I chose a client-side JavaScript implementation so that:

  * the result is an "app" for interactive use,
  * the code can be run both on desktop PC or cell phone,
  * the code can work offline (akin to simple calculator),
  * the code can be easily examined by anyone ([PRs welcomed](https://github.com/Werkov/Werkov.github.io/tree/master/resources/2022-ymp)),
  * (I learn news in the JavaScript ecosystem).

The underlying group for the modified "simplest OT" is [the Ristretto group](https://ristretto.group/)[^ristretto].
I used existing [JavaScript](https://github.com/novifinancial/ristretto255-js)
implementation that builds on top of another "standard" library
[TweetNaCl](https://tweetnacl.js.org/).

[^ristretto]: Initially, I intended to use whole Curve25519 group as implemented by NaCl but
	      the hassle with cofactor handling made me to switch to more
	      robust Ristretto API that works with just the subgroup.

**The message encoding is not stable and may be subject to future change.**
The intended channel for the messages is copy-pasting via clipboard to a communication application.
Currently, I decided to go with raw JSON messages with binary strings encoded with base64[^rsamsg].

The GUI is implemented in plain JavaScript without any framework, to avoid
unnecessary bloat given this is expected to serve as a standalone tool.

[^rsamsg]: Very early concepts used RSA (and built-in Web Crypto API) for OT
	   instead of elliptic curves. Switch to elliptic curves shrunk the
	   messages 16 times.


## References

* Ioannis Ioannidis, Ananth Grama. [An efficient protocol for Yao's
  millionaires' problem](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.110.8816)
* Tung Chou and Claudio Orlandi. [The Simplest Protocol for Oblivious Transfer](https://eprint.iacr.org/2015/267.pdf)
* Ziya Alper Genç, Vincenzo Iovino, and Alfredo Rial. ["The Simplest Protocol for Oblivious Transfer" Revisited](https://eprint.iacr.org/2017/370.pdf)
* Eduard Hauck and Julian Loss. [Efficient and Universally Composable Protocols
  for Oblivious Transfer from the CDH Assumption](https://eprint.iacr.org/2017/1011.pdf)
* [Ristretto group](https://github.com/novifinancial/ristretto255-js)
* [TweetNaCl.js](https://tweetnacl.js.org/)
* Loosely related [Understanding Zero-knowledge proofs through illustrated
  examples](https://blog.goodaudience.com/understanding-zero-knowledge-proofs-through-simple-examples-df673f796d99)


