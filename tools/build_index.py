#!/usr/bin/env python3
"""
Build-time helper for the Learn AI site.

1. Gives every <h2>, <h3> and glossary entry a stable id (so the table of
   contents and the search results can link straight to them).
2. Writes js/search-index.js — a small client-side index of every heading
   and glossary term, with a short snippet of the text that follows it.

Run from the repository root:  python3 tools/build_index.py
"""

import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Page id -> human label used in search results.
PAGES = {
    "index.html": "Home",
    "learn.html": "Learning Paths",
    "neural-networks.html": "Neural Networks",
    "llms.html": "Large Language Models",
    "training.html": "Training",
    "inference.html": "Inference",
    "multimodal.html": "Beyond Text",
    "agents.html": "Agentic AI",
    "robotics.html": "AI & Robotics",
    "implementation.html": "Implementation",
    "evaluation.html": "Evaluation",
    "hardware.html": "Hardware",
    "training-datacenter.html": "Training Data Centers",
    "inference-datacenter.html": "Inference Data Centers",
    "foundry.html": "Foundries",
    "economics.html": "Economics",
    "safety.html": "Safety & Governance",
    "glossary.html": "Glossary",
}

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def slugify(text, used):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]
    if not s:
        s = "section"
    base, n = s, 2
    while s in used:
        s = "%s-%d" % (base, n)
        n += 1
    used.add(s)
    return s


def strip_tags(fragment):
    text = TAG_RE.sub(" ", fragment)
    text = html.unescape(text)
    return WS_RE.sub(" ", text).strip()


def add_heading_ids(source):
    """Add id attributes to h2/h3 headings that do not have one yet."""
    used = set(re.findall(r'\bid="([^"]+)"', source))
    out = []
    pos = 0
    pattern = re.compile(r"<(h2|h3)(\s[^>]*)?>(.*?)</\1>", re.S)
    for m in pattern.finditer(source):
        attrs = m.group(2) or ""
        if "id=" in attrs:
            continue
        text = strip_tags(m.group(3))
        slug = slugify(text, used)
        out.append(source[pos:m.start()])
        out.append('<%s id="%s"%s>%s</%s>' % (m.group(1), slug, attrs, m.group(3), m.group(1)))
        pos = m.end()
    out.append(source[pos:])
    return "".join(out)


def add_glossary_ids(source):
    used = set(re.findall(r'\bid="([^"]+)"', source))
    def repl(m):
        term = strip_tags(m.group(2))
        slug = "term-" + slugify(term, used)
        return '<div class="gloss-entry" id="%s">%s<div class="gloss-term">%s</div>' % (
            slug, m.group(1), m.group(2))
    return re.sub(
        r'<div class="gloss-entry">(\s*)<div class="gloss-term">(.*?)</div>',
        repl, source, flags=re.S)


def snippet_after(source, end_pos, limit=240):
    """Plain text of the content following a heading, up to the next heading."""
    tail = source[end_pos:]
    stop = re.search(r"<h[1-4][\s>]", tail)
    if stop:
        tail = tail[:stop.start()]
    # Drop SVG bodies — they are markup noise, not prose.
    tail = re.sub(r"<svg.*?</svg>", " ", tail, flags=re.S)
    text = strip_tags(tail)
    return text[:limit]


def index_file(filename, source):
    label = PAGES.get(filename, filename)
    entries = []
    for m in re.finditer(r'<(h2|h3)\s[^>]*id="([^"]+)"[^>]*>(.*?)</\1>', source, re.S):
        title = strip_tags(m.group(3))
        if not title:
            continue
        entries.append({
            "u": "%s#%s" % (filename, m.group(2)),
            "p": label,
            "t": title,
            "b": snippet_after(source, m.end()),
        })
    if filename == "glossary.html":
        for m in re.finditer(
            r'<div class="gloss-entry" id="([^"]+)">\s*<div class="gloss-term">(.*?)</div>\s*'
            r'<div class="gloss-def">(.*?)</div>', source, re.S):
            entries.append({
                "u": "glossary.html#%s" % m.group(1),
                "p": "Glossary",
                "t": strip_tags(m.group(2)),
                "b": strip_tags(m.group(3))[:280],
            })
    # Page-level entry so a search for the topic name finds the page itself.
    title_m = re.search(r"<title>(.*?)</title>", source, re.S)
    desc_m = re.search(r'<meta name="description" content="(.*?)"', source, re.S)
    if title_m:
        entries.insert(0, {
            "u": filename,
            "p": label,
            "t": re.split(r"\s*[|—]\s*", html.unescape(title_m.group(1)))[0].strip(),
            "b": html.unescape(desc_m.group(1)) if desc_m else "",
        })
    return entries


def main():
    index = []
    changed = []
    for filename in sorted(PAGES):
        path = os.path.join(ROOT, filename)
        if not os.path.exists(path):
            print("  skip (missing): %s" % filename)
            continue
        with open(path, encoding="utf-8") as fh:
            original = fh.read()
        source = add_heading_ids(original)
        if filename == "glossary.html":
            source = add_glossary_ids(source)
        if source != original:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(source)
            changed.append(filename)
        index.extend(index_file(filename, source))

    out = os.path.join(ROOT, "js", "search-index.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("/* Generated by tools/build_index.py — do not edit by hand. */\n")
        fh.write("window.LEARNAI_INDEX = ")
        json.dump(index, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")

    print("Anchors added to: %s" % (", ".join(changed) if changed else "(none needed)"))
    print("Indexed %d entries -> js/search-index.js" % len(index))
    return 0


if __name__ == "__main__":
    sys.exit(main())
