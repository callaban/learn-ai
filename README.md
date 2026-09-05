# Learn AI

A technical guide to modern artificial intelligence, published with GitHub Pages at
**<https://callaban.github.io/learn-ai/>**.

It covers the whole stack — the mathematics of neural networks, the transformer, training and
inference, agents, robotics, the hardware and data centres underneath, the semiconductor
foundries at the bottom, and the economics and governance around all of it. Every technical
idea opens with a plain-English explanation before the equations, so the same page serves a
curious newcomer and an engineer.

## Structure

```
index.html              Home — topic cards grouped by theme
learn.html              Learning paths, prerequisites, projects, misconceptions

neural-networks.html    Neurons, backpropagation, loss functions, regularisation
llms.html               Attention, transformers, MoE, reasoning models
training.html           Optimisers, scaling laws, distributed training, post-training
inference.html          KV cache, batching, quantisation, speculative decoding
multimodal.html         Diffusion, vision, video, audio, world models

agents.html             The agent loop, tools, context engineering, failure modes
robotics.html           VLAs, the robot data problem, sim-to-real, humanoid hardware
implementation.html     PyTorch, fine-tuning, LoRA, deployment, MCP
evaluation.html         Benchmarks, contamination, LLM-as-judge, agent evals

hardware.html           GPUs, TPUs, custom silicon, HBM, interconnects
training-datacenter.html    Clusters, fabrics, power, cooling, fault tolerance
inference-datacenter.html   Serving architecture, caching, cost modelling
foundry.html            EUV, process nodes, packaging, yield, export controls

economics.html          Financing, IPOs, circular capital, open vs closed, US/EU/China
safety.html             Alignment, interpretability, failure modes, regulation
glossary.html           130+ definitions, filterable

css/style.css           Single stylesheet, light and dark themes
js/site.js              Navigation, theme toggle, search, tables of contents
js/search-index.js      Generated — do not edit by hand
tools/build_index.py    Assigns heading anchors and regenerates the search index
tools/shell.py          Expands @@NAV:<page>@@ / @@FOOTER@@ placeholders in new pages
```

## Working on it

The site is plain static HTML with no build step for content — edit a page and reload it.
Two things are generated, and one command regenerates both:

```sh
python3 tools/build_index.py
```

That gives every `<h2>`/`<h3>` and glossary term a stable `id`, then rewrites
`js/search-index.js` from the current page content. **Run it after adding or renaming any
heading, or the site search will point at anchors that no longer exist.**

To preview locally:

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

### Adding a page

1. Copy the shape of an existing page. Use `@@NAV:<page-id>@@` where the navigation goes and
   `@@FOOTER@@` at the end, then run `python3 tools/shell.py yourpage.html` to expand them.
2. Register the page in the `PAGES` array in `js/site.js` (title, group, one-line blurb) and,
   if it belongs in the guided sequence, in `READING_ORDER`.
3. Add it to `PAGES` in `tools/build_index.py` so it gets indexed for search.
4. Add a card on `index.html` and a line in the `<noscript>` list in `tools/shell.py`.
5. Run `python3 tools/build_index.py`.

### House style

- Open each major idea with a `<div class="plain">` box that explains it with no jargon.
- Keep the equations and real numbers. The plain-language box is an on-ramp, not a replacement.
- Use `<div class="callout warn">` for the thing readers get wrong, `fact` for a surprising
  consequence, `danger` for a genuine hazard.
- Close a page with a `<div class="checkpoint">` of self-check questions and a
  `<div class="takeaways">` summary.
- Date anything that will age. This industry's figures have a shelf life of months; its
  mathematics does not.

## Contributing

Corrections are welcome — particularly to figures describing a fast-moving industry, which go
stale quickly. Open an issue or a pull request.

## Licence

Content and code in this repository are provided for educational use.
