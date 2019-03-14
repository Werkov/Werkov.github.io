---
layout: post
title: TODO Overcommit
tags: musing scheduling
---

## Examples

* memory
  * permit allocations even though they can't be backed by physical memory 
* CPU time
  * run more tasks on a single CPU (preemption vs cooperation)
* airplane seats
  * sell more tickets than available seats
* loans
  * spending more than income
* banks
  * investing money that aren't mine


## Generalization

* finite amount of a resource $R$
* sequence of requests $(t, d, a, r)$
  * $t$ timestamp of the request
  * $d$ duration of the requst
  * $c$ actual use of the resource
  * $r$ request amount of the resource 

* $\forall \tau \sum_{\tau in [t, t+d]} a \le R$ and everything is OK

## Various

### Banker's algorithm

### Effect on latency

### Starvation?

