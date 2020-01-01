---
layout: post
title: Synchronous people
tags: ['socialization', 'distributed systems', 'communication']
---

## Synchronous and asynchronous communication

The synchronous communication is such a way of communication when the
information exchange between involved parties takes place at the same time.
Conversely, the asynchronous communication allows (time) decoupling of the
communicating entities.

## Examples of sync communication

  * face to face, dialogue
  * phone calls
  * instant messaging, chats
  * video calls, conference calls

## Examples of async communication

  * letters, notice board
  * SMS
  * e-mail
  * ticket systems


## Pros of asynchronous communication

### Noise dampening

Asynchronous communication does not mandate immediate response, hence it gives
senders time to analyze incoming information and to not respond to noise.

Furthermore, it also provides time for composing a readable message (thinking
of typos).

Unnecessary emotional responses can also be considered the noise.

### No interrupts

Asynchronous communication needn't reaction to interrupts or notifications.
The receiver can schedule on their own the best time to process the incoming
data.
The liberty to assess the importance is given to the receiver, the sender does
not intrude receivers attention.
This also leverages time management -- time to communicate, time to execute.

### Not affected by busy receiver

Asynchronous communication does not prevent sender from independent activities
while the receiver is busy or absent (also out of business hours).
A synchronous sender will be blocked or keep retrying.

### No schedule fragmentation

As a way of coping with interrupts or being busy, the synchronous communicants
may coordinate a common date for the session.
This leads to fragmentation of their schedule, potentially wasting their time.

### Multiple streams

Since neither the sender nor the receiver are completely busy during
asynchronous exchange, they can participate in multiple conversations/exchanges
in parallel.

### Implicit archiving

There is a middle entity in the asynchronous communication that conveys the
messages.
This provides easy archive, documentation and repeatability of the
communication.


## Cons of asynchronous communication

### Response time and deadlines

When a deadline is approaching the synchronous communication provides better
measure of response times, hence facilitates better action planning under the
tight schedule.

### Need to handle timeouts

A timeout in asynchronous communication can be either a consequence of a
deadline or failure to obtain a response (the other party rejected to respond,
the message got lost).
If the response is relevant for the sender, they must *have a strategy for the
timeout answers*.
The timeouts add up in [case of more parties
communicating](https://en.wikipedia.org/wiki/Consensus_(computer_science)),
rendering the overall resolution time impractical.

### Ultimate blocking

In the case the sender is in a context where/when they cannot progress
otherwise without a response, then synchronous communication is potentially
preferred.

### No absolute time

Despite there is [no absolute
time](https://en.wikipedia.org/wiki/Absolute_space_and_time), typical human
interactions happen much slower than speed of light.
The "speed" of asynchronous communication can be significantly slower than the
light (it takes arbitrary time between the send and delivery).
This can be circumvented with [distributed communication
protocols](https://en.wikipedia.org/wiki/Logical_clock), however, the absence
of common time reference may lead to confusions and misunderstandings,
especially if more than two communicating parties are involved.

### Lack of personal contact

The interpersonal contact by the means of synchronous communication is
beneficial for initiating an action/activity of the receiver.

When a resource is passed along the message, asynchronous delivery may support
fraud ("here's the money" vs "I won't see how you handle the money").

## Common antipatterns

### Multipath

Situation when a message arrives through asynchronous channel (e.g. e-mail) and
the sender notifies through synchronous channel in parallel or soon after
(either synchronous communication is justified and sufficient or the
notification eliminates asynchronous benefits).

### Last minute storm

When deadline approaches and there is a bulk of communication to happen, it may
cause synchronous messaging storm and overload.

### Phone calls
Phone calls combine the lack of personal contact with all
- verbal/nonverbal

## Recommendations

[Important does not mean
urgent](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method),
i.e. consider the deadline for the information exchange.
Also mind the asymmetry between the sender and the receiver (the sender may not
notice an interrupt but receiver does).

Avoid last minute storm by better (not only time) management.

## Further reading

  * [Companies based on async communication](https://www.remoteonly.org/)
  * [Against the synchronous society](https://www.kimonote.com/@mildbyte/against-the-synchronous-society-3146/)
  * [Dead letter box](https://en.wikipedia.org/wiki/Dead_drop)
  * [How to escape the ‘hyperactive hivemind’ of modern work](https://www.bbc.com/worklife/article/20190715-how-to-escape-the-hyperactive-hivemind-of-modern-work)

