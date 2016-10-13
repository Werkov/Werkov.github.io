---
layout: post
title: Báječný svět digitálního podpisu (book)
tags: book PGP legislation
---

Reading period: ~week in Sep 2016.

## About the book

The book was written by Jiří Peterka who is well known to all students of MFF
UK for his lectures on networking. 
Its nice that the book is published under permissive license and is available
also in ebook formats (i.e. not PDF).

## Content

### 1 Základní pojmy a souvislosti

Basic overview, good to unify dictionary with educated readers.

### 2 Vytváření elektronických podpisů

Just basic principles for dummies (e.g. trying hard to explain that digital
signature is different from a classical stamp).

### 3 Ověřování digitálních podpisů

"Algorithm" how signatures are verified in the PKI (public key infrastructure)
and certificate lifespan.


### 4 Elektronický podpis z pohledu práva

The chapter that drew my attention to this book.
The legislation is somewhat vague but consistent (luckily).
In short -- to communicate with state/government you need a certificate issued
by someone whom they trust.

### 5 Elektronický podpis v počítači

Skimmed. Manual how to use certificate stores and related utilities.

### 6 PDF dokumenty a elektronický podpis

Skimmed. I was shocked by utilities that besides digitally signing a PDF also
add a visual stamp into the document. What?!

### 7 Elektronický podpis v MS Office

Skipped.

### 8 Šifrování přihlašování a zabezpečená komunikace

Skipped.
		 

## Topics

  - terminology
    - message vs document
      - both are pieces of information, message is meant to be sent, document
	rather stored
    - document
      - paper (listinná) vs elektronic (elektronická) form
      - written (písemná) form
        - in contrast with image, sound or video (think about plaintext)
    - electronic signature (elektronický podpis)
      - Czech legislation is faulty (digital signature is better fitting)
    - electronic stamp (elektronická značka)
      - digital signature created automatically (without a personal certificate)
  - digital signatures
    - zaručený (guaranteed)
      - plain digital signature (e.g. PGP signatures)
    - kvalifikovaný (qualified)
      - CA that issued the signing certificate is qualified (e.g. it verifies
	identity of owner) and certificate mentiones it's qualified
    - uznávaný
      - it's qualified and issuing CA is acredited (i.e. approved by state)
      - such digital signature can be used for official communication with state
  - main disadvantages of digital signatures
    - hash collisions
    - certificate expiration (due to increasing computational power)
  - result of verification is ternary
    - valid, invalid (revoked certificates?), can't decide (e.g. expired
      certificates)
  - digital continuity
    - how to oversome limited lifespan of digital signatures
    - periodical re-signing of the documents
    - trusted entity (notary)
  - what is identity
    - person can't be identified by certificate itself (it'd be easy to steal
      the identity, thus the separate private key)
    - problem is matching certificates and real persons since *name + surname*
      isn't universally unique
      - you can't put birth identifier (*rodné číslo*) into the public
	certificates in the Czech Republic (OTOH Slovakian certificates
	contain such a unique identifier)
  - ISO norms 
    - those paid overengineered standards (e.g. for signing PDFs, XMLs (office
      documents) etc.)
    - why not RFC?
  - purpose of a certificate
    - security measure -- signing certificate can't be used for authentication
      (you could forge the authentication prompts)


## Form

  - educational and lots of explanations with precise definitions
  - implementations are demonstrated with screenshots
  - many footnotes (with more or less extensions)
