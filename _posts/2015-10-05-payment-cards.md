---
layout: post
title: Payment cards entropy
tags: number
---

## Naïve fantasy

Every decimal digit conveys $\log_2(10) \approx 3.3 $ bits of entropy.
All payment cards, I've seen so far, use 16 digits,
thus we have $\approx 53$ bits of entropy per ideal payment card.

## Simple facts

Last digit is a control digit and last four digits are often printed on
various receipts,
thus from security point of view they bear no entropy at all.

The first six digits are *Issuer Identification Number*, the name of the issuer
is on the receipt as well (e.g. Master Card, Visa, ...).
I don't know how much are these numbers predictable, for sure they are known to
the particular issuer. Let's say the IIN contains about 10 bits of entropy.

We have six digits left for unique user/card number, to sum it up:

  * IIN: 10 bits (6 digits),
  * user number: ~20 bits (6 digits),
  * last four digits: 0 bits (4 digits).

Altogether, we have some 30 bits of entropy per card, which gives us about
1 billion possibilities ($10^9$).

## Other considerations

  * Payment card have expiration of three years, however, all cards I had from
    one bank shared the same number across the generations.
    <del>I don't get the point of the expiration dates...</del>
    They add $\log_2(36)$ ~5 bits of entropy (for a currently valid card).
  * [CSC][1] can add up to 10 bits more entropy.
    * CSC is [generated][2] from the card number and expiration dates, however,
      for general attacker they are undistiguishable from random (i.e. ~10 bits).
  * I've always needed card number, expiration dates and CSC for internet payments.

## Conclusion

Ideal payment card would contain up to $53+5+10 = 68$ bits of entropy.
Under some conditions the entropy of the card can be reduced to about only 30 bits.

## References

  * [Wikipedia][1]
  * [Stack Overflow][3]

[1]: https://en.wikipedia.org/wiki/Card_security_code
[2]: https://en.wikipedia.org/wiki/Card_security_code#Generation_of_CSC
[3]: http://stackoverflow.com/a/72801/1351874

