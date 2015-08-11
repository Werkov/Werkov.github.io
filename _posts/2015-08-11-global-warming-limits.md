---
layout: post
title: Global warming limits
tags: physics
---

## Motivation

First, I thought the global warming is inevitable since only defense from
Earth's perpective would be to reflect the incoming energy back to space and if
that's not possible, the Earth would just accumulate energy from the Sun
(neglecting internal nuclear Earth's sources of energy).

Thus the question is -- what is a spherical black body temperature one
astronomical unit away from the Sun?

## Calculation

The power received from Sun at 1 astronomical unit is

$$
\frac{\pi r_{Earth}^2}{4 \pi \cdot (1 AU)^2} P_\odot \,.
$$

By the Stefan-Boltzmann radiation law the radiated power is

$$
4 \pi r_{Earth}^2 \sigma T^4\,.
$$

Together, the equilibrium temperature is thus

$$
T = \sqrt[4]{\frac{P_\odot}{16 \pi (1 AU)^2 \sigma}}\,.
$$

Feeding this into [Wolfram Alpha][1] (reducing incoming power by Earth albedo),
we obtain the equilibrium temperature of Earth $T \approx -25 °C$.

## Conclusion

This is clearly a very naïve calculation.
Earth is not in a thermodynamic equilibrium, its internal sources probably
aren't negligible and this simple model cannot explain nor predict global
warming :-(


*Is there an error? Send me a message (e.g. on Github or an e-mail).*

[1]: http://www.wolframalpha.com/input/?i=%28%281-earth+albedo%29+*+solar+power+%2F+%2816*pi+*+stefan-boltzmann+constant+*+AU^2%29%29^%281%2F4%29
