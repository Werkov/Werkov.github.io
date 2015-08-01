---
layout: post
title: Captured variables in PHP anonymous functions
tags: php
---

{% highlight php startinline=true %}
class Foo {
        public $id;

        public function __construct($id) {
                $this->id = $id;
        }
}


/* Initialize objects */
$N = 10;
$a = array();
for ($i = 0; $i < $N; ++$i) {
        $a[] = new Foo($i);
}

/* Prepare callbacks (with capture)  */
$callbacks = array();
foreach($a as $key => $object) {
	// though $object is same variable, refers to different objects
        $callbacks[$key] = function() use($object) {
                echo $object->id . "\n";
        };
}

/* Invoke callbacks */
foreach($callbacks as $callback) {
        $callback();
}

{% endhighlight %}


# Output

    0
    1
    2
    3
    4
    5
    6
    7
    8
    9

The moral is: it captures the object by reference, not the actual variable.

