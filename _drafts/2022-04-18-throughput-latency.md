---
layout: post
title: Throughput vs latency
tags: statistics sysadmin maths programming queueing
---

There is the notion you cannot have good throughput and good latency at the
same time.
(Higher throughput is better, shorter latency is better.)
Is this supported by practice?

## Practical examples

### Backbone connection

### Manufacturer pipeline

### Train and car

### Waiters

### Elevator

### Subway

- I make trains go $n$ times faster -> throughput increases $n$ times
- I add $n$ times more carriages -> throughput increase $n$ times, latency constant
- I add $n$ times more carriages -> latency increases, throughput stays ???

## Theory

I like the particularly simple yet general theorem called [Little's
Law](https://en.wikipedia.org/wiki/Little%27s_law) that tells
\\[
	L = w \lambda
\\]
where
$\lambda$ is mean arrival rate (rq/s), $w$ is the mean time a single request
spends in the system (s).
The product has dimension of (rq) and it's the mean (over time) number of
requests present in the system.

If we consider the system is balanced, i.e. arrival rate equals leaving rate,
we can identify the throughput as $t = \lambda$.

The Little's Law transforms into 
\\[
	L = w t
\\]

That is nice the Little's Law quantifies the relation between throughput vs
latency exclusivity.

$n$ times increase in throughput happens along $n$ times decrease in latency.
(???)

Or if we conserve the latency, we must expand the in-flight request count $n$
times.
(Mind that Little's law does account for preemption, bounded queue.)


## When theory fails

- bounded queue

