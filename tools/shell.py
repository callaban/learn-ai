#!/usr/bin/env python3
"""Expand @@NAV:<page-id>@@ and @@FOOTER@@ placeholders in page sources."""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

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

FOOTER = """<footer>
  <p>Learn AI · <a href="index.html">All topics</a> · <a href="glossary.html">Glossary</a> ·
     <a href="https://github.com/callaban/learn-ai">Source on GitHub</a></p>
  <p class="foot-note">An open educational resource. Figures describing a fast-moving industry are dated
     where they matter; treat forward-looking items as informed projections, not certainties.
     Corrections and additions are welcome via GitHub.</p>
</footer>
<script src="js/search-index.js" defer></script>
<script src="js/site.js" defer></script>"""


def expand(text):
    text = re.sub(r"@@NAV:([a-z0-9-]+)@@",
                  lambda m: '<nav id="site-nav" data-page="%s"></nav>\n%s' % (m.group(1), NOSCRIPT),
                  text)
    return text.replace("@@FOOTER@@", FOOTER)


def main(argv):
    for path in argv:
        with open(path, encoding="utf-8") as fh:
            src = fh.read()
        out = expand(src)
        if out != src:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(out)
            print("expanded", os.path.basename(path))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
