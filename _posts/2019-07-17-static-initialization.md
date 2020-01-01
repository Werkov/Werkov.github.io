---
layout: post
title: Static initialization
tags: c++ c programming
---

Let's start simply with a global static variable

{% highlight c %}
static int val;
{% endhighlight %}

Although it looks like an uninitialized variable, the C language guarantees that
global variables are zeroed by default. (And it's cheap to implement, since the
variables reside in well known memory, which is [zeroed when allocated](https://en.wikipedia.org/wiki/.bss).)

Another step is 

{% highlight c %}
static int val = 1;
{% endhighlight %}

initialization with a constant. Piece of cake, the value will be stored written
into the `.data` section.

Let's get [indirect](https://xkcd.com/754/)

{% highlight c %}
static int val = 1;
static int *ptr_val = &val;
{% endhighlight %}

We can't store a constant into `.data` section because we don't know what the
address of `val` will be.
That's where relocations come handy. We only reserve sufficient space in
`.data` under given offset and add a respective relocation entry into a
relocation table.
Basically, the entry says: "After sections are mapped into memory, take address
of `val` and patch it onto offset `ptr_val`."

Let's say that for some reason we want to store additional data in lower bits
of a pointer variable

{% highlight c %}
#define mark_ptr(t, p, v) (t *)((unsigned long long)(p) | (v))

static int val = 1;
static int *ptr_val = mark_ptr(int, &val, 1);
{% endhighlight %}

Trying to compile this spits the error:

{% highlight console %}
$ gcc -c static.c
static.c:1:27: error: initializer element is not constant
 #define mark_ptr(t, p, v) (t *)((unsigned long long)(p) | (v))
                           ^
static.c:4:23: note: in expansion of macro ‘mark_ptr’
 static int *ptr_val = mark_ptr(int, &val, 1);
                       ^~~~~~~~
{% endhighlight %}

No wonder, we modify the address and that operation does not fit into the
relocations table, so compiler complains about non-constant expression.

What about the following code?

{% highlight c %}
#define add_ptr(t, p, v) (t *)((unsigned long long)(p) + (v))

static int val = 1;
static int *ptr_val = add_ptr(int, &val, 1);
{% endhighlight %}

The compilation succeeds :-o If you are thinking of arrays right now, you are
nailing it.

The relocation entries actually allow specifing an *addend* for each resolved address.

{% highlight console %}

$ readelf -r static.o

Relocation section '.rela.data.rel.local' at offset 0x188 contains 1 entry:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000000000  000300000001 R_X86_64_64       0000000000000000 .data + 1
{% endhighlight %}

As a closing note, let's try different compiler for the `mark_ptr` example

{% highlight console %}
$ g++ -c static.c
{% endhighlight %}

Succeeded, but that is another language and another story...
