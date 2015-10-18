---
layout: post
title: Shared memory consistency models
---

This is for me, when I'll need to brush up on these principles and won't be
able to spend time reparsing and understaning primary sources again.

## Causal ordering

Causal ordering or happens-before relation is a fundamental notion for distributed systems.
It is a relation two events in a distributed system.
The relation can be derived from these three basic rules:

  * Event A that happens before event B on the same node (that's important, we
    can use e.g. local clock to compare) is causally precedent to event B.
  * Receiving a particular message is causally dependent on sending the message.
  * The happens-before relation is *transitive*.

*Note* Not all events are comparable in this relations.
Such events are called *concurrent* events.

## Consistency models

Assumption we have a shared memory accessible over interface:

  * `R(x)` -- read address `x`,
  * `W(x, v)` -- write value `v` to address `x`.

### Strict ordering

Every `R(x)` returns the value that was last written at address `x`.
It must hold globally, i.e. we need absolute time in the form of global clock.

    A: W(x, 1)
    B:         W(x, 2)
    C:                 R(x)

`C` should only read `2`.
(Horizontal axis in the diagram represents real absolute time.)

### Sequential ordering

Global trace of actually performed operations represent some serialization of
(interleaved) operations from individual nodes.

    A:  W(x, 1)      W(x, 2)
    B:          R(x)         R(x)

Anything that fits a possible interleaving is sequentially ordered
(e.g. `1, 1`, `1, 2`, `2, 2` but not `2, 1`).

### Causal ordering

Analogy of happens-before relation.
Reads that occur after writes of a particular address (in real time) are
causally dependents on those writes.

    A: W(x, 1)           W(x, 3)
    B: W(x, 2)
    C:         R(x)              R(x)
    D:              R(x)

First writes from `A` and `B` are concurrent.
Both `C` and `D` could read either value from `A` or `B`.

### PRAM consistence

All nodes see writes from a particular node in the same order as they were
issued on the writing node.

    A: W(x, 1)
    B:         R(x) W(x, 2)
    C:                      R(x) R(x)
    D:                      R(x) R(x)

It's valid for `C` and `D` to read `1, 2` or `2, 1`. 
(If it were causal ordering, only `2` could be read.)

### Slow memory

Writes to a particular address are seen by all in the same order.
However, some may still see an old value.

## Consistency models with synchronization

Apart from read and write operations, we introduce helping operations that
signal our intentions (they operate on special address -- a synchronization
variable `SV`):

  * general synchronization `S`,
  * acquire `Acq`
  * and release  `Rel`.

### Weak consistency

`S` operations are sequentially ordered, before accessing `SV` any writes are
finished and inversely any access to data is conditioned by finishing `SV`
operations.

### Release consistency

Here we use acquire and release instead of a single synchronization operation.
Own `Acq` must be finished before accessing data and similarly before `Rel` all
my reads and writes must be finished.
On top of that, `Acq` and `Rel` have to be PRAM consistent.

(Think of commits: after `Rel` or lazily before `Acq`.)

### Entry consistency

Synchronization variables for particular data.
Distinguish shared (read) and exclusive (write) access.

## Related

### Reliable multicast

unordered, source ordering, causal ordering; total ordering.

### Theory of relativity

no absolute time, potential causality of events (distance in spacetime, cones).

