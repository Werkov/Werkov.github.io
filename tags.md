---
layout: page
title: Tags
---

<div id='tag_cloud'>
{% comment %}https://stackoverflow.com/a/49549166{% endcomment %}
{% assign tags = "" | split:"" %}
{% for t in site.tags %}
  {% assign tags = tags | push: t[0] %}
{% endfor %}
{% assign sorted_tags = tags | sort_natural %}

{% for t in sorted_tags %}
<a href="#{{ t }}" title="{{ t }}" class="tag-size-{{ site.tags[t].size | at_most:10 }}">{{ t }}</a>

{% endfor %}
</div>

<ul id='tag_list'>
{% for t in sorted_tags %}
  <li class='tag_item' id='{{ t }}'>
    <span class='tag_name'>{{ t }}</span>
    <span>
      <ul>
      {% for post in site.tags[t] %}
        <li class='tag_post'><a href="{{ post.url }}" title="{{ post.title }}">{{ post.title }}</a></li>
      {% endfor %}
      </ul>
    </span>
  </li>
{% endfor %}
</ul>

