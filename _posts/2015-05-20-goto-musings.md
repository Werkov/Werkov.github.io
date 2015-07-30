---
layout: post
---

====== GOTO musings ======

This mostly applies for C programming where I came across following pattern.

{% highlight  c %}
int some_function(...) {
    some_resource_t res_1;
    
    int rc = operation1(...);
    
    if (rc != EOK) {
        release(&res_1);
        return rc;
    }
    
    some_resource_t res_2;
    rc = operation2(...)
    
    if (rc != EOK) {
        release(&res_2);
        release(&res_1);        
        return rc;
    }
    
    // and so on
    
    release(&res_n);
    // ...
    release(&res_1);    
    
    return EOK;
}
{% endhighlight %}

Resources may be anything (memory, lock, file). I find it highly uncomfortable to write these exceptional aborts and prone to resource leaks.

This can be done much more nicely using goto
{% highlight  c %}
    // first declare all resource (they may be acquired later)
    some_resource_t res_1;
    // ...
    some_resource_t res_n;
    
    int rc = operation1(...);
    
    if (rc != EOK) {
        goto finish;
    }
    
    rc = operation2(...)
    
    if (rc != EOK) {
        goto finish;
    }
    
    // and so on
    rc = EOK;

finish:    
    // all resource are released at once
    release(&res_n);
    // ...
    release(&res_1);    
    
    return rc;
}
{% endhighlight %}

This is obviously much more readable and safe.

===== Are there any advantages of the first version? =====
  * You release only what is actually acquired (in the case that even release of unallocated resource has some costs (e.g. `free(NULL)`)).
  * You have very strong reluctance to `goto`. This may apply if your code already uses some `goto`s.


===== Other solutions =====

  * GNU extensions of C language provide option of [[https://gcc.gnu.org/onlinedocs/gcc/Common-Variable-Attributes.html#index-g_t_0040code_007bcleanup_007d-variable-attribute-3333|variable attribute `cleanup`]] that allows you to associate a function that's called when released should be performed.
  * Use [[https://en.wikipedia.org/wiki/Resource_Acquisition_Is_Initialization|C++ or other languages]].

