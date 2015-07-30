---
layout: post
---

<file php>
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
        $callbacks[$key] = function() use($object) {
                echo $object->id . "\n";
        };
}

/* Invoke callbacks */
foreach($callbacks as $callback) {
        $callback();
}

</file>


title: "Output"
<file>
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
</file>
