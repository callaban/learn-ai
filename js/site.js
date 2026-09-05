/* ============================================================
   Learn AI — shared site behaviour
   Builds the navigation, the theme toggle, the search overlay,
   per-page tables of contents, and prev/next links.
   Progressive enhancement: every page also ships a <noscript>
   list of links, so the site remains navigable without JS.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Site map: the single source of truth for nav ---------- */
  var PAGES = [
    { id: 'index',                file: 'index.html',                title: 'Home',                    group: null },

    { id: 'learn',                file: 'learn.html',                title: 'Learning Paths',
      blurb: 'Where to start and in what order',                     group: 'Start' },
    { id: 'neural-networks',      file: 'neural-networks.html',      title: 'Neural Networks',
      blurb: 'Neurons, weights, backpropagation',                    group: 'Foundations' },
    { id: 'llms',                 file: 'llms.html',                 title: 'Large Language Models',
      blurb: 'Attention and the transformer',                        group: 'Foundations' },
    { id: 'training',             file: 'training.html',             title: 'Training Models',
      blurb: 'Optimisers, scaling laws, post-training',              group: 'Foundations' },
    { id: 'inference',            file: 'inference.html',            title: 'Inference',
      blurb: 'How a trained model answers you',                      group: 'Foundations' },
    { id: 'multimodal',           file: 'multimodal.html',           title: 'Beyond Text',
      blurb: 'Diffusion, vision, video, world models',               group: 'Foundations' },

    { id: 'agents',               file: 'agents.html',               title: 'Agentic AI',
      blurb: 'Models that take actions, not just answer',            group: 'Systems' },
    { id: 'robotics',             file: 'robotics.html',             title: 'AI & Robotics',
      blurb: 'Embodied AI and humanoid machines',                    group: 'Systems' },
    { id: 'implementation',       file: 'implementation.html',       title: 'Implementation',
      blurb: 'PyTorch, fine-tuning, deployment',                     group: 'Systems' },
    { id: 'evaluation',           file: 'evaluation.html',           title: 'Evaluation & Benchmarks',
      blurb: 'How we measure whether a model is good',               group: 'Systems' },

    { id: 'hardware',             file: 'hardware.html',             title: 'AI Hardware',
      blurb: 'GPUs, TPUs, memory, interconnects',                    group: 'Infrastructure' },
    { id: 'training-datacenter',  file: 'training-datacenter.html',  title: 'Training Data Centers',
      blurb: 'Clusters, networks, power, cooling',                   group: 'Infrastructure' },
    { id: 'inference-datacenter', file: 'inference-datacenter.html', title: 'Inference Data Centers',
      blurb: 'Serving models at global scale',                       group: 'Infrastructure' },
    { id: 'foundry',              file: 'foundry.html',              title: 'Semiconductor Foundries',
      blurb: 'EUV, process nodes, packaging, yield',                 group: 'Infrastructure' },

    { id: 'economics',            file: 'economics.html',            title: 'The Economics of AI',
      blurb: 'Financing, IPOs, open vs closed, US/EU/China',         group: 'Consequences' },
    { id: 'safety',               file: 'safety.html',               title: 'Safety & Governance',
      blurb: 'Alignment, interpretability, regulation',              group: 'Consequences' },

    { id: 'glossary',             file: 'glossary.html',             title: 'Glossary',                group: null }
  ];

  /* Reading order used for the prev/next footer links. */
  var READING_ORDER = ['learn', 'neural-networks', 'llms', 'training', 'inference', 'multimodal',
    'agents', 'robotics', 'implementation', 'evaluation', 'hardware', 'training-datacenter',
    'inference-datacenter', 'foundry', 'economics', 'safety', 'glossary'];

  var GROUP_ORDER = ['Start', 'Foundations', 'Systems', 'Infrastructure', 'Consequences'];

  function byId(id) {
    for (var i = 0; i < PAGES.length; i++) { if (PAGES[i].id === id) return PAGES[i]; }
    return null;
  }

  /* ---------- Theme ---------- */
  var THEME_KEY = 'learnai-theme';

  function currentTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) { /* private mode */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
      btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    applyTheme(next);
  }

  /* ---------- Navigation ---------- */
  function buildNav(navEl, activeId) {
    var groups = {};
    PAGES.forEach(function (p) {
      if (!p.group) return;
      (groups[p.group] = groups[p.group] || []).push(p);
    });

    var inner = document.createElement('div');
    inner.className = 'nav-inner';

    var brand = document.createElement('a');
    brand.className = 'nav-brand' + (activeId === 'index' ? ' active' : '');
    brand.href = 'index.html';
    brand.innerHTML = 'Learn<span>AI</span>';
    inner.appendChild(brand);

    GROUP_ORDER.forEach(function (groupName) {
      var items = groups[groupName];
      if (!items || !items.length) return;

      var wrap = document.createElement('div');
      wrap.className = 'nav-group';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = groupName;
      btn.setAttribute('aria-expanded', 'false');

      var menu = document.createElement('div');
      menu.className = 'nav-menu';

      items.forEach(function (p) {
        var a = document.createElement('a');
        a.href = p.file;
        a.innerHTML = p.title + (p.blurb ? '<small>' + p.blurb + '</small>' : '');
        if (p.id === activeId) { a.className = 'active'; wrap.classList.add('has-active'); }
        menu.appendChild(a);
      });

      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var wasOpen = wrap.classList.contains('open');
        closeAllMenus();
        if (!wasOpen) { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });

      wrap.appendChild(btn);
      wrap.appendChild(menu);
      inner.appendChild(wrap);
    });

    var gloss = document.createElement('a');
    gloss.href = 'glossary.html';
    gloss.textContent = 'Glossary';
    if (activeId === 'glossary') gloss.className = 'active';
    inner.appendChild(gloss);

    var spacer = document.createElement('div');
    spacer.className = 'nav-spacer';
    inner.appendChild(spacer);

    var searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'nav-tool';
    searchBtn.id = 'search-open';
    searchBtn.innerHTML = '🔍 Search <kbd>/</kbd>';
    searchBtn.addEventListener('click', openSearch);
    inner.appendChild(searchBtn);

    var themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.className = 'nav-tool';
    themeBtn.id = 'theme-toggle';
    themeBtn.addEventListener('click', toggleTheme);
    inner.appendChild(themeBtn);

    navEl.innerHTML = '';
    navEl.appendChild(inner);
  }

  function closeAllMenus() {
    var open = document.querySelectorAll('.nav-group.open');
    for (var i = 0; i < open.length; i++) {
      open[i].classList.remove('open');
      var b = open[i].querySelector('button');
      if (b) b.setAttribute('aria-expanded', 'false');
    }
  }

  /* ---------- Search ---------- */
  var overlay, input, results, selIndex = 0, currentHits = [];

  function buildSearchUI() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML =
      '<div class="search-box">' +
      '<input type="text" id="search-input" placeholder="Search the whole guide — try &quot;KV cache&quot;, &quot;agent&quot;, &quot;EUV&quot;, &quot;IPO&quot;…" autocomplete="off" spellcheck="false">' +
      '<div class="search-results" id="search-results"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#search-input');
    results = overlay.querySelector('#search-results');

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('input', runSearch);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
      else if (e.key === 'Enter') {
        var sel = results.querySelector('a.sel');
        if (sel) { e.preventDefault(); window.location.href = sel.href; }
      }
    });
  }

  function openSearch() {
    if (!overlay) buildSearchUI();
    overlay.classList.add('open');
    input.value = '';
    renderHits([]);
    input.focus();
  }
  function closeSearch() { if (overlay) overlay.classList.remove('open'); }

  function moveSel(delta) {
    var links = results.querySelectorAll('a');
    if (!links.length) return;
    selIndex = Math.max(0, Math.min(links.length - 1, selIndex + delta));
    for (var i = 0; i < links.length; i++) links[i].classList.toggle('sel', i === selIndex);
    links[selIndex].scrollIntoView({ block: 'nearest' });
  }

  function runSearch() {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) { renderHits([]); return; }
    var terms = q.split(/\s+/);
    var index = window.LEARNAI_INDEX || [];
    var hits = [];

    index.forEach(function (entry) {
      var hay = (entry.t + ' ' + entry.p + ' ' + entry.b).toLowerCase();
      var score = 0, matchedAll = true;
      terms.forEach(function (term) {
        var pos = hay.indexOf(term);
        if (pos === -1) { matchedAll = false; return; }
        score += 10;
        if (entry.t.toLowerCase().indexOf(term) !== -1) score += 40;
        if (entry.t.toLowerCase().indexOf(term) === 0) score += 25;
        if (entry.p.toLowerCase().indexOf(term) !== -1) score += 8;
      });
      if (matchedAll) hits.push({ e: entry, s: score });
    });

    hits.sort(function (a, b) { return b.s - a.s; });
    renderHits(hits.slice(0, 25).map(function (h) { return h.e; }), q);
  }

  function renderHits(hits, q) {
    selIndex = 0;
    currentHits = hits;
    if (!hits.length) {
      results.innerHTML = input && input.value.trim().length >= 2
        ? '<div class="search-empty">No matches. Try a shorter or more general term.</div>'
        : '<div class="search-empty">Type at least two characters. Results search every heading and summary across the guide.</div>';
      return;
    }
    var html = '';
    hits.forEach(function (e, i) {
      html += '<a href="' + e.u + '" class="' + (i === 0 ? 'sel' : '') + '">' +
        '<span class="sr-page">' + escapeHtml(e.p) + '</span>' +
        '<span class="sr-title">' + escapeHtml(e.t) + '</span>' +
        '<span class="sr-snip">' + escapeHtml(e.b.slice(0, 165)) + (e.b.length > 165 ? '…' : '') + '</span>' +
        '</a>';
    });
    results.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- Table of contents ---------- */
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function buildToc() {
    var host = document.getElementById('toc');
    if (!host) return;
    var main = document.querySelector('main');
    if (!main) return;
    var heads = main.querySelectorAll('h2');
    if (heads.length < 3) { host.remove(); return; }

    var ol = document.createElement('ol');
    var used = {};
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i];
      var text = h.textContent.trim();
      var id = h.id;
      if (!id) {
        var section = h.parentElement && h.parentElement.tagName === 'SECTION' ? h.parentElement : null;
        id = (section && section.id) || slugify(text) || 'section-' + i;
        while (used[id]) { id = id + '-x'; }
        h.id = id;
      }
      used[id] = true;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = text;
      li.appendChild(a);
      ol.appendChild(li);
    }
    var det = document.createElement('details');
    det.className = 'toc';
    det.open = true;
    det.innerHTML = '<summary>On this page</summary>';
    det.appendChild(ol);
    host.replaceWith(det);
  }

  /* ---------- Prev / next ---------- */
  function buildPageNav(activeId) {
    var main = document.querySelector('main');
    if (!main || !activeId || activeId === 'index') return;
    var idx = READING_ORDER.indexOf(activeId);
    if (idx === -1) return;
    var prev = idx > 0 ? byId(READING_ORDER[idx - 1]) : null;
    var next = idx < READING_ORDER.length - 1 ? byId(READING_ORDER[idx + 1]) : null;
    if (!prev && !next) return;

    var nav = document.createElement('nav');
    nav.className = 'page-nav';
    nav.setAttribute('aria-label', 'Reading order');
    if (prev) {
      nav.innerHTML += '<a class="prev" href="' + prev.file + '">' +
        '<span class="pn-label">← Previous</span><span class="pn-title">' + prev.title + '</span></a>';
    }
    if (next) {
      nav.innerHTML += '<a class="next" href="' + next.file + '">' +
        '<span class="pn-label">Next →</span><span class="pn-title">' + next.title + '</span></a>';
    }
    main.appendChild(nav);
  }

  /* ---------- Glossary live filter ---------- */
  function wireGlossaryFilter() {
    var box = document.getElementById('gloss-filter');
    if (!box) return;
    var count = document.getElementById('gloss-count');
    var entries = Array.prototype.slice.call(document.querySelectorAll('.gloss-entry'));
    var letters = Array.prototype.slice.call(document.querySelectorAll('.gloss-letter'));
    var total = entries.length;

    function refresh() {
      var q = box.value.trim().toLowerCase();
      var shown = 0;
      entries.forEach(function (el) {
        var match = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
        el.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      letters.forEach(function (letter) {
        var any = false, n = letter.nextElementSibling;
        while (n && !n.classList.contains('gloss-letter')) {
          if (n.classList.contains('gloss-entry') && n.style.display !== 'none') { any = true; break; }
          n = n.nextElementSibling;
        }
        letter.style.display = any ? '' : 'none';
      });
      if (count) {
        count.textContent = q
          ? shown + ' of ' + total + ' terms match “' + box.value.trim() + '”'
          : total + ' terms defined. Start typing to filter.';
      }
    }
    box.addEventListener('input', refresh);
    refresh();
  }

  /* ---------- Boot ---------- */
  function init() {
    var navEl = document.getElementById('site-nav');
    var activeId = (navEl && navEl.getAttribute('data-page')) ||
      (document.body.getAttribute('data-page')) || '';
    if (navEl) buildNav(navEl, activeId);
    applyTheme(currentTheme());
    buildToc();
    buildPageNav(activeId);
    wireGlossaryFilter();

    document.addEventListener('click', closeAllMenus);
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      var typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
      if (e.key === 'Escape') { closeSearch(); closeAllMenus(); return; }
      if (typing) return;
      if (e.key === '/') { e.preventDefault(); openSearch(); }
      else if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    });
  }

  /* Apply the stored theme as early as possible to avoid a flash of light. */
  applyTheme(currentTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
