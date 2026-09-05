#!/usr/bin/env python3
"""One-shot migration: move existing pages onto the shared nav/theme/search shell."""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGE_IDS = {
    "index.html": "index",
    "neural-networks.html": "neural-networks",
    "training.html": "training",
    "inference.html": "inference",
    "llms.html": "llms",
    "training-datacenter.html": "training-datacenter",
    "inference-datacenter.html": "inference-datacenter",
    "hardware.html": "hardware",
    "foundry.html": "foundry",
    "implementation.html": "implementation",
    "glossary.html": "glossary",
}

NOSCRIPT = """<noscript>
  <div class="ns-nav">
    <a href="index.html">Home</a> · <a href="learn.html">Learning Paths</a> ·
    <a href="neural-networks.html">Neural Networks</a> · <a href="llms.html">LLMs</a> ·
    <a href="training.html">Training</a> · <a href="inference.html">Inference</a> ·
    <a href="multimodal.html">Beyond Text</a> · <a href="agents.html">Agentic AI</a> ·
    <a href="robotics.html">Robotics</a> · <a href="implementation.html">Implementation</a> ·
    <a href="evaluation.html">Evaluation</a> · <a href="hardware.html">Hardware</a> ·
    <a href="training-datacenter.html">Training DCs</a> · <a href="inference-datacenter.html">Inference DCs</a> ·
    <a href="foundry.html">Foundry</a> · <a href="economics.html">Economics</a> ·
    <a href="safety.html">Safety</a> · <a href="glossary.html">Glossary</a>
  </div>
</noscript>"""

SCRIPTS = '<script src="js/search-index.js" defer></script>\n<script src="js/site.js" defer></script>\n'

FOOTER = """<footer>
  <p>Learn AI · <a href="index.html">All topics</a> · <a href="glossary.html">Glossary</a> ·
     <a href="https://github.com/callaban/learn-ai">Source on GitHub</a></p>
  <p class="foot-note">An open educational resource. Figures describing a fast-moving industry are dated
     where they matter; treat forward-looking items as informed projections, not certainties.
     Corrections and additions are welcome via GitHub.</p>
</footer>"""


def migrate(path, page_id):
    with open(path, encoding="utf-8") as fh:
        src = fh.read()

    # 1. Replace the hand-written nav with the shared placeholder.
    src = re.sub(r"<nav>.*?</nav>",
                 '<nav id="site-nav" data-page="%s"></nav>\n%s' % (page_id, NOSCRIPT),
                 src, count=1, flags=re.S)

    # 2. Insert the table-of-contents placeholder on content pages.
    if page_id not in ("index",) and "<main" in src and 'id="toc"' not in src:
        src = re.sub(r"(<main[^>]*>)", r'\1\n\n<div id="toc"></div>', src, count=1)

    # 3. Swap the footer for the shared one.
    src = re.sub(r"<footer>.*?</footer>", FOOTER, src, count=1, flags=re.S)

    # 4. Load the shared scripts.
    if "js/site.js" not in src:
        src = src.replace("</body>", SCRIPTS + "</body>", 1)

    # 5. Give every page a description if it lacks one (helps search + SEO).
    if 'name="description"' not in src:
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        if title:
            desc = title.group(1).split("|")[0].strip()
            src = src.replace("<link rel=\"stylesheet\"",
                              '<meta name="description" content="%s — part of the Learn AI guide.">\n  <link rel="stylesheet"' % desc, 1)
    return src


def main():
    for fname, pid in sorted(PAGE_IDS.items()):
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path):
            continue
        out = migrate(path, pid)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(out)
        print("migrated", fname)
    return 0

if __name__ == "__main__":
    sys.exit(main())
