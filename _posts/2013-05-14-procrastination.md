---
layout: post
title: Admissible reasons to postpone activity
tags: musing 
---

## 1) Priority
  * deadline induced
    * postpone in favor of activity with earlier deadline
  * importance induced 
    * postpone in favor of activity with higher importance
    * importance measure? money, reputation impact

## 2) Cost of the context switch

  * interrupt
    * time quantum not long enough to finish the activity (depends on time estimates)
    * can be avoided with careful context store&load on interrupt/resume

## 3) Spacetime block

  * not proper place
    * activity is bound to certain place => move to that place
  * waiting for end of another activity
  * waiting for resource (occupied, non-existent)
    * try buy, multiply, strengthen,... the resource

## 4) Fatigue
  * activities where lack of attention could lead to damage, loses, etc.
  * solution: have a rest (and then fulfill the activity), use drugs

## 5) Optimization
  * reordering makes for better time/resource utilization
    * by reducing transfers, context switches,...
  * be aware of "premature optimization" -- i.e. rather work than over-plan

---


## Notes

  * **Warning** It's also important to have an external source if interrupts to
    allow at least scheduling the activities (aka non-cooperative scheduling).
  * Do you still have more than one activity to do? The you must optimize (e.g.
    utility).
  * Deadline and blocking activity form a *launch window*.
