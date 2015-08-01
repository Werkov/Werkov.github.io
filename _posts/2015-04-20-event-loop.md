---
layout: post
title: What is event loop?
tags: programming
---


## Define: nonblocking vs asynchronous 
  * blocking -- does the call occupy the stack
  * synchronous -- how messages are delivered
    * does the call deliver the message
    * alternatively does the call achieve the effect

Common code for demonstration of possibilities of (non)blocking (a)synchronous
behavior, `do()` is the studied call.

{% highlight  c %}
typedef struct {
    void (*cb)(int data);
    int data;
} job_t;

/* queue of job_t */
queue pending;

void process_pending(void) {
    while (!pending.empty()) {
        job_t job = pending.pop();
        job->cb(job->data);
    }
}

struct {
   int data;
} receiver;


int main(int argc, char *argv[]) {
    /* This (global) is the studied message receiver. */
    receiver.data = 0;
    
    /* This is the studied call */
    do();
    
    do_some_other_stuff();
    
    process_pending();
    
    return 0;
}
{% endhighlight %}

### Blocking and synchronous
{% highlight  c %}
void do() {
    int sum = 0;
    for (int i = 0; i < 10000000; ++i) {
        sum += i;
    }
    receiver.data = sum;
}
{% endhighlight %}

### Blocking and asynchronous 
{% highlight  c %}
void setter(int data) {
    receiver.data = data;
}

void do() {
    int sum = 0;
    for (int i = 0; i < 10000000; ++i) {
        sum += i;
    }
    pending.push({&setter, sum});
}
{% endhighlight %}

### Nonblocking and synchronous 
{% highlight  c %}
void do() {
    receiver.data = 3;
}
{% endhighlight %}

### Nonblocking and asynchronous 
{% highlight  c %}
void setter(int data) {
    receiver.data = data;
}

void do() {
    int sum = 3;
    pending.push({&setter, sum});
}
{% endhighlight %}

## Insights 
  * Blocking means current <del>thread</del>execution container cannot progress
    with the routine's code (considering the routine itself). Effectively it
    may be a long computing subroutine call or being unscheduled(e.g. blocking
    I/O).
  * <del>Multithreading</del> Mutliple execution containers are quite
    orthogonal concept to blocking.
    * You may use other execution containers to achieve non-blocking behavior
      even with time consuming subroutines.
      * blocking, synchronous -> non-blocking, synchronous
	* e.g. use other thread for calculation, assign a
	  [future](http://en.wikipedia.org/wiki/Futures_and_promises) to
	  receiver
    * **Other execution containers help you to get rid of blocking-ness.**
    * Note that with preemptive scheduling you must synchronize access to
      shared data (`receiver`, `queue`).

## Asynchronous APIs 

I think there are following asynchronous APIs:

  * callbacks,
  * blocking wait calls,
  * polling
  * and message passing?.

### Callbacks 

{% highlight  c %}
void handler(void *result) {
    receiver.data = result;
}
...

/* 
 * Issue the request for the operation and provide a handler that is
 * called back upon completion
 */
do(&handler);
{% endhighlight %}

### Blocking wait calls 
{% highlight  c %}
/* Issue the request and obtain a handle to the request */
req = do();

/* Blocking call until operation finishes */
receiver.data = waitfor(req);
{% endhighlight %}

### Polling 
{% highlight  c %}
/* Issue the request */
do();

/* 
 * Non-blocking call that can return invalid value though.
 * Note that if you abstract away the loop, it's actually a blocking call.
 */
while (get_result() != NONE) {
}

/* XXX */
receiver.data = get_result();
{% endhighlight %}

On the line marked with `XXX`, we assume uninterrupted flow in order to consequently work with a valid result. This may be achieved by non-preemptive scheduling or using condition variables.

### Message passing 
This approach requires some encapsulation of communication entities. FIXME it's just a different view on previous approaches.

{% highlight  c %}
/* This sends a message to the executive entity */
do();

...
void on_message(void *msg) {
    /* 
     * Here we process incoming messages.
     * E.g. the result of the operation
     */
    receiver.data = msg->payload;
}
{% endhighlight %}

## Events 
  * Events form an intermediate link between caller and callee/sender and receiver.
    * It allows implementing both synchronous and asynchronous behavior.
      * Qt's direct and queue connections (also sent and posted events).
    * It may also allow runtime (dis)connection of senders/receivers.
  * Generally we want to avoid blocking in receivers/callees as it blocks whole program or event loop (in async scenario).
    * Partial remedy is calling `processEvents` (or similar) from within the blocking call.

### Events without loop (synchronous events) 

Calling `raise_event` is synchronous and depending on the actual listeners, it may also be blocking.

Note that if a raised event raises another instance of itself it may lead to stack overflow.

{% highlight  c %}
#include <stdio.h>
#include <stdlib.h>
 
typedef void (*listener_t)(void *);
 
struct listener_item {
        listener_t listener;
        struct listener_item *next;
};
 
typedef struct listener_item listener_item_t;
 
 
typedef struct {
        listener_item_t *first;
        listener_item_t *last;
} event_type_t;
 
void raise(event_type_t *e, void *arg) {
        listener_item_t *it = e->first;
        while (it != NULL) {
                it->listener(arg);
                it = it->next;
        }
}
 
void add_listener(event_type_t *e, listener_t listener) {
        listener_item_t *li = malloc(sizeof(listener_item_t));
        li->listener = listener;
        li->next = NULL;
 
        if (e->last == NULL) {
                e->first = e->last = li;
        } else {
                e->last->next = li;
        }
}
 
void event_init(event_type_t *e) {
        e->first = e->last = NULL;
}
 
 
#define E_STARTED 0
#define E_FOOED 1
#define E_BARED 2
#define E_TYPED 2
#define E_LAST_ 3
 
event_type_t event_types[E_LAST_];
 
 
// --- custom handlers ---
void reader(void *);
void fooed(void *);
 
void started(void *arg) {
        printf("%s(%p)\n", __func__, arg);
        raise(&event_types[E_FOOED], "fooed");
}
 
void reader(void *arg) {
        int c;
        while ((c = getchar()) != EOF) {
                if (c == 'x')
                        break;
                raise(&event_types[E_TYPED], (void *)c);
        }
}
 
void printer(void *arg) {
        int c = (int)arg;
        printf("typed %c\n", c);
}
 
void fooed(void *arg) {
        printf("%s(%s)\n", __func__, (char *)arg);
}
 
int main() {
        for (int i = 0; i < E_LAST_; ++i) {
                event_init(&event_types[i]);
        }
 
        add_listener(&event_types[E_STARTED], reader);
        add_listener(&event_types[E_STARTED], started);
        add_listener(&event_types[E_TYPED], printer);
 
 
        raise(&event_types[E_STARTED], NULL);
 
        return 0;
}
{% endhighlight %}

### Events with loop (asynchronous events) 

Calling `raise_event` is asynchronous and typically non-blocking (for blocking call, one would perform the computation inside `raise_event` and store result to the queue, which would be later assigned during `process_event` call).

This approach brings another level of versatility since each execution container can have it's own queue (access to which needs to be correctly synchronized).

Shown only modification to the code above (the rest is same).

{% highlight  c %}
event_queue_t event_queue;

/* Defer the actual execution by storing event arguments to a queue. */
void raise(event_type_t *et, void *arg) {
        event_t e = {et, arg};
        push(event_queue, e);    
}

void process_event(event_type_t *et, void *arg) {
        listener_item_t *it = et->first;
        while (it != NULL) {
                it->listener(arg);
                it = it->next;
        }
}

int main() {
        for (int i = 0; i < E_LAST_; ++i) {
                event_init(&events[i]);
        }
 
        add_listener(&events[E_STARTED], reader);
        add_listener(&events[E_STARTED], started);
        add_listener(&events[E_TYPED], printer);
     
        raise(&event_types[E_STARTED], NULL);
        
        while (!empty(event_queue)) {
                event = pop(event_queue);
                process_event(e.et, e.data);
        }
 
        return 0;
}
{% endhighlight %}

Or as Philip Roberts says it in his
[JsConf](https://www.youtube.com/watch?v=8aGhZQkoFbQ) talk:

> Look at the stack and the task queue. If the stack is empty, take task from
> the task queue.

## References 
  * <https://wiki.qt.io/Threads_Events_QObjects>
  * <http://berb.github.io/diploma-thesis/original/>
  * <http://www.kegel.com/c10k.html>
  * <http://blog.nindalf.com/how-goroutines-work/>




