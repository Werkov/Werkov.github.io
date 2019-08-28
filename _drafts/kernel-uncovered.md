---
title: Things you would not expect in kernel
layout: post
tags: kernel
---

idea: microkernel (memory, scheduler)

JIT compiler (BPF)
debugger (unwinder)
FD API to everything (signalfd, timerfd, userfaultfd, eventfd, ...)

monkey patching
fs/dlm/lowcomms.c:1340

weird syscalls: acct(2)

spiral of development
- sessions, autogroups, session scopes
- redesigned APIs (-2 suffix)
