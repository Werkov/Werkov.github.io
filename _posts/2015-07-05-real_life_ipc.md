---
layout: post
---

====== Real life IPC ======

Combination of recent readings about IPC in various microkernel systems together with crammed information about message ordering in distributed system lead to seed of an idea in my head. Add information I read about [[https://www.rekola.cz/|Rekola]] bike sharing service and noble feats of Rychle šípy, I used to read as a child, and you'll understand a dream (not a wish-dream, just a sleep-dream) I had.

Few coordinators accept little papers with messages and deliver them to registered users of the service. During coordination you can nicely review all the distributed communication principles (e.g. source ordering) you learned at school. In my dream, we decided to broadcast few invitation messages. Our network had around 4,000 members and throughput was about 4 messages/hour (we had only two active members, it was in Prague). So the dream didn't show up as a good business plan or any plan at all.

Later I realized it already [[https://postmates.com/|exists]] (I read it previously, it just merged into my dream).
