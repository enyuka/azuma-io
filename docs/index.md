---
layout: home
title: トップ
---

<ul class="post-list">
  {%- assign items = site.articles | sort: "date" | reverse -%}
  {%- for a in items -%}
    <li>
      <span class="post-meta">{{ a.date | date: "%Y-%m-%d" }}</span>
      <h3>
        <a class="post-link" href="{{ a.url | relative_url }}">{{ a.title }}</a>
      </h3>
      {%- if a.excerpt -%}
        <p>{{ a.excerpt | strip_html | truncate: 140 }}</p>
      {%- endif -%}
    </li>
  {%- endfor -%}
</ul>
