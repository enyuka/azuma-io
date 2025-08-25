---
layout: page
title: Articles
permalink: /articles/
---

# 記事一覧

<ul>
  {% for article in site.articles %}
    <li>
      <a href="{{ article.url }}">{{ article.title }}</a>
    </li>
  {% endfor %}
</ul>
