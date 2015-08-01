---
layout: post
title: Spot the error
tags: bughunt c++
---

This is very hideous bug (took me at least quarter an hour (including the
blogpost). Originaly it was [structure keeping data
only](http://en.wikipedia.org/wiki/Anemic_domain_model), later I added `.cc`
file with implementation of `Clone` method. It did not compile...

{% highlight cpp %}
// frame.h
#ifndef DOVE_EYE_FRAME_H_
#define DOVE_EYE_FRAME_H_

#include <cstdint>

#include <opencv2/opencv.hpp>

namespace dove_eye {

struct Frame {
  typedef double Timestamp;
  typedef double TimestampDiff;

  Timestamp timestamp;
  cv::Mat data;

  Frame Clone() const;
};

} // namespace dove_eye

#endif // DOVE_EYE_FRAME_H_
{% endhighlight %}

{% highlight cpp %}
// frame.cc
#include "dove_eye/frame.h"

namespace dove_eve {

Frame Frame::Clone() const {
  Frame result(*this);
  result.data = data.clone();
  return result;
}

} // namespace dove_eve
{% endhighlight %}


And compilers output:

    /home/michal/school/dove-eye/git/dove-eye/lib/src/frame.cc:5:1: error: ‘Frame’ does not name a type
     Frame Frame::Clone() {
     ^

# Solution

Using `namespace dove_eve`. instead of `namespace dove_eye`.


