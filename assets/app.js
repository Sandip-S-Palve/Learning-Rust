/* ==========================================================================
   Rust for the .NET Architect — shared behaviour
   Include in <head> AFTER course-data.js (no defer) so the theme is applied
   before first paint; everything else runs on DOMContentLoaded.

   Page contract
     <body data-chapter="2.3">          chapter page (id from course-data.js)
     <body data-page="index|styleguide|…"> other pages
     <article class="content"> … </article>   the only required element
   ========================================================================== */
(function () {
  "use strict";

  var COURSE = window.COURSE || { modules: [], glossary: [], pages: [] };
  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  var BASE = SCRIPT_SRC ? SCRIPT_SRC.replace(/assets\/app\.js(\?.*)?$/, "") : "./";
  var STORE_KEY = "rust-course:v1";

  /* ---------- Storage (always wrapped: may throw or be unavailable) ---------- */
  var memoryStore = {};
  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return memoryStore; }
  }
  function saveState(state) {
    memoryStore = state;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function getState() {
    var s = loadState();
    s.done = s.done || {};
    s.quiz = s.quiz || {};
    s.nav = s.nav || {};
    return s;
  }
  function update(fn) { var s = getState(); fn(s); saveState(s); return s; }

  /* ---------- Theme (runs immediately) ---------- */
  var themeListeners = [];
  function storedTheme() { return getState().theme || "auto"; }
  function effectiveTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme(storedTheme());
  // ?theme=light|dark forces a theme for this page load only (handy for testing and screenshots).
  var forcedTheme = (window.location.search.match(/[?&]theme=(light|dark)\b/) || [])[1];
  if (forcedTheme) applyTheme(forcedTheme);
  function setTheme(t) {
    update(function (s) { s.theme = t; });
    applyTheme(t);
    notifyTheme();
  }
  function notifyTheme() {
    var eff = effectiveTheme();
    themeListeners.forEach(function (fn) { try { fn(eff); } catch (e) { console.error(e); } });
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onMq = function () { if (storedTheme() === "auto") notifyTheme(); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- Course model helpers ---------- */
  var chapters = [];
  COURSE.modules.forEach(function (m, mi) {
    m.chapters.forEach(function (c) {
      chapters.push({
        id: c[0], title: c[1], est: c[2], prereqs: c[3], concepts: c[4], slug: c[5], status: c[6],
        module: m, moduleIndex: mi,
        file: "chapters/" + c[0].toLowerCase().replace(/\./g, "-") + "-" + c[5] + ".html"
      });
    });
  });
  var byId = {};
  chapters.forEach(function (c, i) { c.index = i; byId[c.id] = c; });
  function isAvailable(c) { return c && c.status !== "planned"; }
  function href(path) { return BASE + path; }

  /* ---------- Small DOM helpers ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (ch) { if (ch) n.appendChild(typeof ch === "string" ? document.createTextNode(ch) : ch); });
    return n;
  }
  function slugify(s) {
    return s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "section";
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  var toastTimer;
  function toast(msg) {
    var t = document.querySelector(".toast") || document.body.appendChild(el("div", { "class": "toast", role: "status" }));
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }

  /* ---------- Lazy library loader (pinned versions) ---------- */
  var LIBS = {
    prism: ["https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"],
    prismLangs: ["rust", "toml", "csharp", "bash", "json", "sql", "yaml", "protobuf", "wasm"].map(function (l) {
      return "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-" + l + ".min.js";
    }),
    katexCss: "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css",
    katex: ["https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"],
    katexAuto: ["https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"],
    mermaid: ["https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"],
    chart: ["https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"],
    d3: ["https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"]
  };
  var scriptCache = {};
  function loadScript(src) {
    if (!scriptCache[src]) {
      scriptCache[src] = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = src; s.async = false;
        s.onload = resolve;
        s.onerror = function () { reject(new Error("Failed to load " + src)); };
        document.head.appendChild(s);
      });
    }
    return scriptCache[src];
  }
  function loadAll(list) { return list.reduce(function (p, src) { return p.then(function () { return loadScript(src); }); }, Promise.resolve()); }
  function loadCss(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    document.head.appendChild(el("link", { rel: "stylesheet", href: href }));
  }
  function load(name) {
    if (name === "prism") { window.Prism = window.Prism || { manual: true }; return loadAll(LIBS.prism).then(function () { return loadAll(LIBS.prismLangs); }); }
    if (name === "katex") { loadCss(LIBS.katexCss); return loadAll(LIBS.katex).then(function () { return loadAll(LIBS.katexAuto); }); }
    if (LIBS[name]) return loadAll(LIBS[name]);
    return Promise.reject(new Error("Unknown library " + name));
  }
  function offlineNotice(container, what) {
    if (!container) return;
    container.appendChild(el("p", { "class": "muted small", text: "⚠ " + what + " could not load (are you offline?). The text content above still applies." }));
  }

  /* ---------- Theme colours for charts / scripted visuals ---------- */
  function colors() {
    var cs = getComputedStyle(document.documentElement);
    function v(n) { return cs.getPropertyValue(n).trim(); }
    var c = {
      text: v("--text"), muted: v("--muted"), border: v("--border"), surface: v("--surface"), surface2: v("--surface-2"),
      accent: v("--accent"), teal: v("--teal"), purple: v("--purple"), red: v("--red"), amber: v("--amber"),
      green: v("--green"), blue: v("--blue"), font: v("--font-body"), mono: v("--font-mono")
    };
    c.series = [c.accent, c.teal, c.purple, c.blue, c.amber, c.green, c.red];
    return c;
  }

  /* ---------- Shell: header, sidebar, toc, pager, footer ---------- */
  var ICONS = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
    mark: '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="var(--accent)"/><path d="M10 22V10h7a4 4 0 0 1 0 8h-7m6 0 5 4" fill="none" stroke="var(--bg)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function buildHeader() {
    var themeBtn = el("button", { "class": "icon-btn", type: "button", "aria-label": "Change colour theme" });
    function paintThemeBtn() {
      var t = storedTheme();
      themeBtn.innerHTML = ICONS[t === "light" ? "sun" : t === "dark" ? "moon" : "auto"];
      themeBtn.title = "Theme: " + t + " (click to change)";
    }
    themeBtn.addEventListener("click", function () {
      var order = ["auto", "light", "dark"];
      setTheme(order[(order.indexOf(storedTheme()) + 1) % 3]);
      paintThemeBtn();
      toast("Theme: " + storedTheme());
    });
    paintThemeBtn();

    var menuBtn = el("button", { "class": "icon-btn menu-btn", type: "button", "aria-label": "Open navigation", "aria-expanded": "false", html: ICONS.menu });
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    var input = el("input", { type: "search", placeholder: "Search  ( / )", "aria-label": "Search the course", autocomplete: "off" });
    var results = el("div", { "class": "search-results", role: "listbox" });
    var search = el("div", { "class": "search" }, [input, results]);
    wireSearch(input, results);

    var progress = el("div", { "class": "header-progress", title: "Chapters marked complete" }, [
      el("div", { "class": "progress-bar" }, [el("span")]),
      el("span", { "class": "progress-text" })
    ]);

    var header = el("header", { "class": "site-header" }, [
      menuBtn,
      el("a", { "class": "brand", href: href("index.html"), html: ICONS.mark + '<span class="brand-text">' + escapeHtml(COURSE.title || "Course") + "</span>" }),
      el("div", { "class": "header-spacer" }),
      search, progress, themeBtn
    ]);
    return header;
  }

  function refreshProgress() {
    var s = getState();
    var done = chapters.filter(function (c) { return s.done[c.id]; }).length;
    var pct = chapters.length ? Math.round((done / chapters.length) * 100) : 0;
    document.querySelectorAll(".header-progress .progress-bar > span").forEach(function (b) { b.style.width = pct + "%"; });
    document.querySelectorAll(".header-progress .progress-text").forEach(function (t) { t.textContent = done + " / " + chapters.length + " done"; });
    document.querySelectorAll(".nav-module li[data-id]").forEach(function (li) {
      var chk = li.querySelector(".nav-check");
      if (chk) chk.textContent = s.done[li.getAttribute("data-id")] ? "✓" : "";
    });
    document.querySelectorAll("[data-progress-module]").forEach(function (bar) {
      var mod = COURSE.modules.filter(function (m) { return m.id === bar.getAttribute("data-progress-module"); })[0];
      if (!mod) return;
      var n = mod.chapters.filter(function (c) { return s.done[c[0]]; }).length;
      bar.style.width = Math.round((n / mod.chapters.length) * 100) + "%";
    });
    document.dispatchEvent(new CustomEvent("course:progress", { detail: { done: done, total: chapters.length } }));
  }

  function buildSidebar(currentId) {
    var s = getState();
    var nav = el("nav", { "class": "sidebar", "aria-label": "Course navigation" });
    var links = el("div", { "class": "sidebar-links" });
    (COURSE.pages || []).forEach(function (p) {
      links.appendChild(el("a", { href: href(p.file), text: p.title }));
    });
    if (links.childNodes.length) nav.appendChild(links);

    var current = byId[currentId];
    COURSE.modules.forEach(function (m) {
      var collapsedPref = s.nav[m.id];
      var isCurrentModule = current && current.module === m;
      var collapsed = collapsedPref === undefined ? !isCurrentModule : collapsedPref;
      if (isCurrentModule) collapsed = false;
      var written = m.chapters.filter(function (c) { return c[6] !== "planned"; }).length;
      var btn = el("button", { type: "button", "aria-expanded": String(!collapsed), html:
        '<span class="nav-id">' + escapeHtml(m.id) + "</span><span>" + escapeHtml(m.title) +
        ' <span class="mod-count">' + written + "/" + m.chapters.length + '</span></span><span class="chev">▾</span>' });
      var ul = el("ul");
      m.chapters.forEach(function (c) {
        var ch = byId[c[0]];
        var li = el("li", { "data-id": ch.id });
        var inner = '<span class="nav-id">' + escapeHtml(ch.id) + "</span><span>" + escapeHtml(ch.title) + '</span><span class="nav-check"></span>';
        if (isAvailable(ch)) {
          var a = el("a", { href: href(ch.file), html: inner });
          if (ch.id === currentId) { a.classList.add("current"); a.setAttribute("aria-current", "page"); }
          li.appendChild(a);
        } else {
          li.appendChild(el("span", { "class": "planned", title: "Not written yet", html: inner }));
        }
        ul.appendChild(li);
      });
      var wrap = el("div", { "class": "nav-module" + (collapsed ? " collapsed" : "") }, [btn, ul]);
      btn.addEventListener("click", function () {
        var nowCollapsed = wrap.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", String(!nowCollapsed));
        update(function (st) { st.nav[m.id] = nowCollapsed; });
      });
      nav.appendChild(wrap);
    });
    return nav;
  }

  function buildToc(article) {
    var heads = article.querySelectorAll("h2, h3");
    if (heads.length < 3) return null;
    var toc = el("aside", { "class": "toc", "aria-label": "On this page" }, [el("h4", { text: "On this page" })]);
    var linkFor = {};
    heads.forEach(function (h) {
      if (!h.id) {
        var id = slugify(h.textContent), n = 2, base = id;
        while (document.getElementById(id)) id = base + "-" + n++;
        h.id = id;
      }
      var a = el("a", { href: "#" + h.id, text: h.textContent, "class": h.tagName === "H3" ? "level-3" : "" });
      linkFor[h.id] = a;
      toc.appendChild(a);
    });
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("active"); });
            if (linkFor[en.target.id]) linkFor[en.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-60px 0px -70% 0px" });
      heads.forEach(function (h) { obs.observe(h); });
    }
    return toc;
  }

  function stampText() {
    return "Accurate as of " + COURSE.accurateAsOf + " · Rust " + COURSE.rustVersion + " · Edition " + COURSE.edition;
  }

  function buildChapterHeader(article, ch) {
    var head = el("header", { "class": "chapter-header" });
    head.appendChild(el("div", { "class": "breadcrumb", html:
      '<a href="' + href("index.html") + '">Course</a> › ' + escapeHtml(ch.module.id + " " + ch.module.title) }));
    head.appendChild(el("div", { "class": "chapter-kicker", text: "Chapter " + ch.id }));
    if (!article.querySelector("h1")) head.appendChild(el("h1", { text: ch.title }));
    head.appendChild(el("div", { "class": "stamp", html: "<span>🦀 " + escapeHtml(stampText()) + "</span>" }));
    article.insertBefore(head, article.firstChild);
    var h1 = article.querySelector("h1");
    if (h1 && h1.parentNode !== head) head.insertBefore(h1, head.querySelector(".stamp"));

    // Meta card: author supplies objectives; prereqs + time come from course data.
    var meta = article.querySelector("[data-meta]");
    if (meta) {
      meta.classList.add("meta-card");
      var s = getState();
      var pre = el("div", { "class": "prereqs" }, [el("h4", { text: "Prerequisites" })]);
      if (!ch.prereqs.length) pre.appendChild(el("p", { "class": "small", text: "None — start here." }));
      ch.prereqs.forEach(function (pid) {
        var p = byId[pid];
        if (!p) return;
        var label = p.id + " " + p.title;
        var chip = isAvailable(p) ? el("a", { "class": "chip", href: href(p.file), text: label }) : el("span", { "class": "chip", title: "Not written yet", text: label });
        if (s.done[p.id]) chip.classList.add("done");
        pre.appendChild(chip);
      });
      var time = el("div", null, [el("h4", { text: "Estimated time" }), el("div", { "class": "time", text: "≈ " + ch.est + " h" }),
        el("div", { "class": "small muted", text: "reading + labs + exercises" })]);
      meta.appendChild(pre);
      meta.appendChild(time);
    }
  }

  function buildChapterFooter(article, ch) {
    var s = getState();
    var btn = el("button", { type: "button" });
    function paint() {
      var done = !!getState().done[ch.id];
      btn.textContent = done ? "✓ Completed — click to undo" : "Mark chapter complete";
      btn.classList.toggle("done", done);
    }
    btn.addEventListener("click", function () {
      update(function (st) { if (st.done[ch.id]) delete st.done[ch.id]; else st.done[ch.id] = new Date().toISOString().slice(0, 10); });
      paint(); refreshProgress();
      toast(getState().done[ch.id] ? "Chapter " + ch.id + " marked complete" : "Marked as not complete");
    });
    paint();
    article.appendChild(el("div", { "class": "chapter-complete" }, [btn,
      el("span", { "class": "small muted", text: "Progress is saved in this browser only." })]));

    var prev = chapters[ch.index - 1], next = chapters[ch.index + 1];
    function pagerItem(c, cls, label) {
      if (!c) return el("span", { "class": cls, html: "<small>" + label + "</small>—" });
      var inner = "<small>" + label + " · " + escapeHtml(c.id) + "</small>" + escapeHtml(c.title);
      return isAvailable(c) ? el("a", { "class": cls, href: href(c.file), html: inner }) : el("span", { "class": cls, title: "Not written yet", html: inner });
    }
    article.appendChild(el("nav", { "class": "pager", "aria-label": "Chapter navigation" }, [
      pagerItem(prev, "prev", "← Previous"), pagerItem(next, "next", "Next →")
    ]));
    void s;
  }

  function buildFooter(article) {
    article.appendChild(el("footer", { "class": "site-footer", html:
      escapeHtml(stampText()) + ". Supplementary links were verified live on that date; " +
      'anything uncertain is flagged with a <strong>⚠ Verify</strong> note.' }));
  }

  /* ---------- Search ---------- */
  function searchEntries() {
    var list = [];
    chapters.forEach(function (c) {
      list.push({ title: c.id + " " + c.title, sub: c.module.title + (isAvailable(c) ? "" : " · not written yet"),
        text: (c.title + " " + c.concepts).toLowerCase(), url: isAvailable(c) ? href(c.file) : null, weight: 3 });
    });
    (COURSE.glossary || []).forEach(function (g) {
      var c = byId[g.chapter];
      list.push({ title: g.term, sub: "Glossary · " + g.def.slice(0, 90), text: (g.term + " " + g.def).toLowerCase(),
        url: c && isAvailable(c) ? href(c.file) : href("glossary.html"), weight: 2 });
    });
    (window.SEARCH_INDEX || []).forEach(function (h) {
      list.push({ title: h.heading, sub: "Section in " + h.chapter, text: (h.heading + " " + (h.text || "")).toLowerCase(), url: href(h.url), weight: 1 });
    });
    return list;
  }
  function wireSearch(input, results) {
    var entries = null, active = -1;
    function ensure() {
      if (entries) return;
      entries = searchEntries();
      // Section-level index is optional (built by tools/build_search_index.py).
      loadScript(href("assets/search-index.js")).then(function () { entries = searchEntries(); }).catch(function () {});
    }
    function render(q) {
      ensure();
      results.innerHTML = "";
      active = -1;
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) { results.classList.remove("open"); return; }
      var hits = entries.map(function (e) {
        var ok = terms.every(function (t) { return e.text.indexOf(t) !== -1 || e.title.toLowerCase().indexOf(t) !== -1; });
        if (!ok) return null;
        var score = e.weight + (e.title.toLowerCase().indexOf(terms[0]) !== -1 ? 5 : 0);
        return { e: e, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
      if (!hits.length) results.appendChild(el("div", { "class": "empty", text: "No matches for “" + q + "”" }));
      hits.forEach(function (h) {
        var inner = escapeHtml(h.e.title) + "<small>" + escapeHtml(h.e.sub) + "</small>";
        results.appendChild(h.e.url ? el("a", { href: h.e.url, role: "option", html: inner }) : el("div", { "class": "empty", html: inner }));
      });
      results.classList.add("open");
    }
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () { if (input.value) render(input.value); });
    input.addEventListener("keydown", function (e) {
      var items = results.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.classList.toggle("active", i === active); });
        items[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        var target = items[active] || items[0];
        if (target) window.location.href = target.href;
      } else if (e.key === "Escape") {
        results.classList.remove("open"); input.blur();
      }
    });
    document.addEventListener("click", function (e) { if (!results.contains(e.target) && e.target !== input) results.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); input.focus(); }
    });
  }

  /* ---------- Diagrams: own horizontal scroller (+ hint) on narrow screens ---------- */
  function wrapDiagrams(root) {
    root.querySelectorAll("figure.visual > svg").forEach(function (svg) {
      var wrap = el("div", { "class": "svg-scroll" });
      svg.parentNode.insertBefore(wrap, svg);
      wrap.appendChild(svg);
      requestAnimationFrame(function () {
        if (wrap.scrollWidth > wrap.clientWidth + 4) {
          wrap.parentNode.insertBefore(el("div", { "class": "scroll-hint", text: "← swipe to see the whole diagram →" }), wrap.nextSibling);
        }
      });
    });
  }

  /* ---------- Code blocks: header, copy, Rust Playground ---------- */
  function enhanceCode(root) {
    var blocks = root.querySelectorAll("pre > code[class*='language-']");
    blocks.forEach(function (code) {
      var pre = code.parentNode;
      if (pre.parentNode.classList.contains("code-block")) return;
      var lang = (code.className.match(/language-([\w-]+)/) || [])[1] || "text";
      var wrap = el("div", { "class": "code-block" });
      var actions = el("div", { "class": "actions" });
      var copy = el("button", { "class": "code-btn", type: "button", text: "Copy" });
      copy.addEventListener("click", function () { copyText(code.textContent).then(function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1200); }); });
      if (lang === "rust" && pre.hasAttribute("data-playground")) {
        var url = "https://play.rust-lang.org/?version=stable&mode=debug&edition=" + encodeURIComponent(COURSE.edition || "2024") +
          "&code=" + encodeURIComponent(code.textContent);
        actions.appendChild(el("a", { "class": "code-btn", href: url, target: "_blank", rel: "noopener", text: "Run ▶" }));
      }
      actions.appendChild(copy);
      var head = el("div", { "class": "code-head" }, [
        el("span", { "class": "lang", text: lang }),
        pre.getAttribute("data-title") ? el("span", { text: "· " + pre.getAttribute("data-title") }) : null,
        actions
      ]);
      pre.classList.add("in-block");
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(head);
      wrap.appendChild(pre);
    });
    if (blocks.length) {
      load("prism").then(function () { window.Prism.highlightAllUnder(root); }).catch(function () { /* plain text still readable */ });
    }
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve) {
      var ta = el("textarea", { style: "position:fixed;left:-9999px" });
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta); resolve();
    });
  }

  /* ---------- Math (KaTeX) ---------- */
  function enhanceMath(root) {
    var html = root.innerHTML;
    if (html.indexOf("$$") === -1 && html.indexOf("\\(") === -1) return;
    load("katex").then(function () {
      window.renderMathInElement(root, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
        throwOnError: false
      });
    }).catch(function () { offlineNotice(null, "Math rendering"); });
  }

  /* ---------- Mermaid (re-renders on theme change) ---------- */
  var mermaidCount = 0;
  function enhanceMermaid(root) {
    var nodes = root.querySelectorAll(".mermaid");
    if (!nodes.length) return;
    nodes.forEach(function (n) { if (!n.hasAttribute("data-src")) n.setAttribute("data-src", n.textContent.trim()); });
    function render() {
      var c = colors();
      window.mermaid.initialize({
        startOnLoad: false, securityLevel: "strict", theme: "base",
        themeVariables: {
          darkMode: effectiveTheme() === "dark", background: c.surface, primaryColor: c.surface2, primaryBorderColor: c.border,
          primaryTextColor: c.text, lineColor: c.muted, secondaryColor: c.surface, tertiaryColor: c.surface,
          fontFamily: c.font, fontSize: "15px", clusterBkg: c.surface, edgeLabelBackground: c.surface
        }
      });
      nodes.forEach(function (n) {
        var id = "mmd-" + (++mermaidCount);
        window.mermaid.render(id, n.getAttribute("data-src")).then(function (out) {
          n.innerHTML = out.svg;
          // On narrow screens the diagram scrolls sideways: start centred on it.
          if (n.scrollWidth > n.clientWidth) n.scrollLeft = (n.scrollWidth - n.clientWidth) / 2;
        })
          .catch(function (err) { n.innerHTML = '<pre class="output error">Diagram error: ' + escapeHtml(err.message || err) + "</pre>"; });
      });
    }
    load("mermaid").then(function () { render(); themeListeners.push(render); })
      .catch(function () { nodes.forEach(function (n) { offlineNotice(n.parentNode, "This diagram"); }); });
  }

  /* ---------- Charts (Chart.js, rebuilt on theme change) ----------
     Course.chart(canvasOrId, function (c) { return chartJsConfig; })  — c = theme colours */
  function chart(target, configFn) {
    var canvas = typeof target === "string" ? document.getElementById(target) : target;
    if (!canvas) return Promise.reject(new Error("chart target not found"));
    var instance = null;
    function build() {
      var c = colors();
      window.Chart.defaults.color = c.muted;
      window.Chart.defaults.borderColor = c.border;
      window.Chart.defaults.font.family = c.font;
      if (instance) instance.destroy();
      var cfg = configFn(c);
      cfg.options = cfg.options || {};
      if (cfg.options.maintainAspectRatio === undefined) cfg.options.maintainAspectRatio = false;
      instance = new window.Chart(canvas, cfg);
      return instance;
    }
    return load("chart").then(function () { build(); themeListeners.push(build); return { get: function () { return instance; }, rebuild: build }; })
      .catch(function (e) { offlineNotice(canvas.closest("figure"), "This chart"); throw e; });
  }

  /* ---------- Stepper (step-through animation) ----------
     <figure class="visual stepper">
       <svg> … <g data-show="2">…</g> <rect data-hl="3,5"> … </svg>
       <ol class="stepper-captions"><li>Step 1 text</li>…</ol>
     </figure>
     data-show: "n" = from step n on · "a-b" = steps a..b · "-b" = steps 1..b · "=n" = only n · comma lists allowed
     data-hl:   same syntax, but a bare "n" means only step n
     Scripts can listen: figure.addEventListener("step", e => e.detail.step / e.detail.total) */
  function matchesSpec(spec, step, bareMeansFrom) {
    return spec.split(",").some(function (part) {
      part = part.trim();
      if (!part) return false;
      if (part[0] === "=") return step === +part.slice(1);
      if (part.indexOf("-") !== -1) {
        var ab = part.split("-");
        var a = ab[0] === "" ? 1 : +ab[0], b = ab[1] === "" ? Infinity : +ab[1];
        return step >= a && step <= b;
      }
      return bareMeansFrom ? step >= +part : step === +part;
    });
  }
  function initStepper(fig) {
    if (fig.__stepper) return fig.__stepper;
    var captions = Array.prototype.map.call(fig.querySelectorAll(".stepper-captions > li"), function (li) { return li.innerHTML; });
    var total = Math.max(captions.length, +fig.getAttribute("data-steps") || 0, 1);
    var delay = +fig.getAttribute("data-interval") || 2200;
    var step = 1, timer = null;

    var btnReset = el("button", { type: "button", text: "⟲ Reset" });
    var btnBack = el("button", { type: "button", text: "◀ Back", "aria-label": "Previous step" });
    var btnPlay = el("button", { type: "button", "class": "primary", text: "▶ Play" });
    var btnStep = el("button", { type: "button", text: "Step ▶", "aria-label": "Next step" });
    var dots = el("div", { "class": "stepper-dots", "aria-hidden": "true" });
    for (var i = 0; i < total; i++) dots.appendChild(el("span"));
    var count = el("span", { "class": "stepper-count" });
    var caption = el("div", { "class": "stepper-caption", "aria-live": "polite" });
    var controls = el("div", { "class": "stepper-controls" }, [btnReset, btnBack, btnPlay, btnStep, dots, count]);
    var anchor = fig.querySelector("figcaption");
    fig.insertBefore(controls, anchor);
    fig.insertBefore(caption, anchor);

    function render() {
      fig.querySelectorAll("[data-show]").forEach(function (n) {
        n.classList.toggle("step-hidden", !matchesSpec(n.getAttribute("data-show"), step, true));
      });
      fig.querySelectorAll("[data-hl]").forEach(function (n) {
        n.classList.toggle("step-hl", matchesSpec(n.getAttribute("data-hl"), step, false));
      });
      caption.innerHTML = captions[step - 1] || "";
      count.textContent = step + " / " + total;
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i < step); });
      btnBack.disabled = step <= 1;
      btnStep.disabled = step >= total;
      fig.dispatchEvent(new CustomEvent("step", { detail: { step: step, total: total } }));
    }
    function stop() { clearInterval(timer); timer = null; btnPlay.textContent = "▶ Play"; }
    function go(n) { step = Math.min(Math.max(1, n), total); render(); if (step >= total) stop(); }
    btnStep.addEventListener("click", function () { stop(); go(step + 1); });
    btnBack.addEventListener("click", function () { stop(); go(step - 1); });
    btnReset.addEventListener("click", function () { stop(); go(1); });
    btnPlay.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (step >= total) go(1);
      btnPlay.textContent = "❚❚ Pause";
      timer = setInterval(function () { go(step + 1); }, delay);
    });
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.target !== fig) return;
      if (e.key === "ArrowRight") { stop(); go(step + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { stop(); go(step - 1); e.preventDefault(); }
    });
    render();
    fig.__stepper = { go: go, get step() { return step; }, total: total };
    return fig.__stepper;
  }

  /* ---------- Quizzes ----------
     <div class="quiz" data-quiz="2.3">
       <div class="q" data-answer="b"><div class="q-type">Scenario</div><div class="q-text">…</div>
         <ol class="options"><li data-key="a">…</li>…</ol>
         <div class="explain"><p data-for="a">Why not a…</p><p data-for="b">Why b…</p></div></div>
     </div> */
  function initQuiz(quiz) {
    var qid = quiz.getAttribute("data-quiz") || (document.body.getAttribute("data-chapter") || "page");
    var qs = quiz.querySelectorAll(".q");
    var scoreBox = el("div", { "class": "quiz-score" });
    var resetBtn = el("button", { "class": "code-btn", type: "button", text: "Reset answers" });
    var scoreText = el("span");
    scoreBox.appendChild(scoreText); scoreBox.appendChild(resetBtn);
    quiz.insertBefore(scoreBox, quiz.firstChild);

    function saved() { return getState().quiz[qid] || {}; }
    function paintScore() {
      var answers = saved(), answered = 0, right = 0;
      qs.forEach(function (q, i) {
        if (answers[i] !== undefined) { answered++; if (answers[i] === q.getAttribute("data-answer")) right++; }
      });
      scoreText.innerHTML = "<strong>" + right + " / " + qs.length + "</strong> correct · " + answered + " answered";
    }
    function reveal(q, i, picked) {
      var answer = q.getAttribute("data-answer");
      q.classList.add("answered");
      q.querySelectorAll(".options button").forEach(function (b) {
        var k = b.getAttribute("data-key");
        b.disabled = true;
        if (k === answer) b.classList.add("correct");
        else if (k === picked) b.classList.add("wrong");
      });
      q.querySelectorAll(".explain p[data-for]").forEach(function (p) {
        var k = p.getAttribute("data-for");
        p.classList.toggle("is-correct", k === answer);
        p.classList.toggle("is-picked", k === picked);
      });
    }
    qs.forEach(function (q, i) {
      q.querySelectorAll(".options > li").forEach(function (li) {
        if (li.querySelector("button")) return;
        var key = li.getAttribute("data-key");
        var b = el("button", { type: "button", "data-key": key, html: '<span class="key">' + escapeHtml(key.toUpperCase()) + ".</span><span>" + li.innerHTML + "</span>" });
        b.addEventListener("click", function () {
          if (q.classList.contains("answered")) return;
          update(function (st) { st.quiz[qid] = st.quiz[qid] || {}; st.quiz[qid][i] = key; });
          reveal(q, i, key); paintScore();
        });
        li.innerHTML = ""; li.appendChild(b);
      });
      var prev = saved()[i];
      if (prev !== undefined) reveal(q, i, prev);
    });
    resetBtn.addEventListener("click", function () {
      update(function (st) { delete st.quiz[qid]; });
      qs.forEach(function (q) {
        q.classList.remove("answered");
        q.querySelectorAll(".options button").forEach(function (b) { b.disabled = false; b.classList.remove("correct", "wrong"); });
        q.querySelectorAll(".explain p").forEach(function (p) { p.classList.remove("is-correct", "is-picked"); });
      });
      paintScore();
    });
    paintScore();
  }

  /* ---------- Glossary tooltips: <dfn data-term="ownership">, optional data-def ---------- */
  function initTooltips(root) {
    var gl = {};
    (COURSE.glossary || []).forEach(function (g) { gl[g.term.toLowerCase()] = g; });
    var tip = null;
    function show(target) {
      var key = (target.getAttribute("data-term") || target.textContent).toLowerCase();
      var def = target.getAttribute("data-def") || (gl[key] && gl[key].def);
      if (!def) return;
      tip = tip || document.body.appendChild(el("div", { "class": "tooltip", role: "tooltip" }));
      tip.innerHTML = "<strong>" + escapeHtml(gl[key] ? gl[key].term : target.textContent) + "</strong>" + escapeHtml(def);
      tip.style.display = "block";
      var r = target.getBoundingClientRect();
      var left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - tip.offsetWidth - 12);
      tip.style.left = Math.max(8, left) + "px";
      tip.style.top = (window.scrollY + r.bottom + 8) + "px";
    }
    function hide() { if (tip) tip.style.display = "none"; }
    root.querySelectorAll("dfn, .term").forEach(function (n) {
      if (!n.hasAttribute("tabindex")) n.setAttribute("tabindex", "0");
      n.addEventListener("mouseenter", function () { show(n); });
      n.addEventListener("focus", function () { show(n); });
      n.addEventListener("mouseleave", hide);
      n.addEventListener("blur", hide);
    });
  }

  /* ---------- Index page helpers ---------- */
  function renderModuleGrid(container) {
    var s = getState();
    COURSE.modules.forEach(function (m) {
      var first = m.chapters.map(function (c) { return byId[c[0]]; }).filter(isAvailable)[0];
      var hours = m.chapters.reduce(function (t, c) { return t + c[2]; }, 0);
      var card = el(first ? "a" : "div", { "class": "card", href: first ? href(first.file) : null });
      if (!first) card.removeAttribute("href");
      card.innerHTML = '<div class="chapter-kicker">' + escapeHtml(m.id) + "</div><h3>" + escapeHtml(m.title) + "</h3><p>" +
        m.chapters.length + " chapters · ≈ " + hours + " h</p>" +
        '<div class="card-progress"><span data-progress-module="' + escapeHtml(m.id) + '"></span></div>';
      container.appendChild(card);
    });
    void s;
  }

  /* ---------- Boot ---------- */
  var booted = false;
  function boot() {
    var body = document.body;
    var article = document.querySelector("article.content") || document.querySelector(".content");
    if (!article) return;
    var chapterId = body.getAttribute("data-chapter");
    var ch = chapterId ? byId[chapterId] : null;

    var main = el("main", { "class": "main", id: "main" });
    var layout = el("div", { "class": "layout" });
    article.parentNode.insertBefore(layout, article);
    main.appendChild(article);
    layout.appendChild(buildSidebar(chapterId));
    layout.appendChild(main);
    body.insertBefore(buildHeader(), body.firstChild);
    body.insertBefore(el("a", { "class": "skip-link", href: "#main", text: "Skip to content" }), body.firstChild);

    if (ch) {
      document.title = ch.id + " " + ch.title + " · " + (COURSE.title || "");
      buildChapterHeader(article, ch);
      buildChapterFooter(article, ch);
    }
    buildFooter(article);
    var toc = buildToc(article);
    if (toc) layout.appendChild(toc);

    document.addEventListener("click", function (e) {
      if (body.classList.contains("nav-open") && !e.target.closest(".sidebar")) body.classList.remove("nav-open");
    });

    var grid = document.getElementById("module-grid");
    if (grid) renderModuleGrid(grid);

    wrapDiagrams(article);
    enhanceCode(article);
    enhanceMath(article);
    enhanceMermaid(article);
    article.querySelectorAll(".stepper").forEach(initStepper);
    article.querySelectorAll(".quiz").forEach(initQuiz);
    initTooltips(article);
    refreshProgress();
    booted = true;
    document.dispatchEvent(new CustomEvent("course:ready"));
  }

  /* ---------- Public API for chapter-specific scripts ---------- */
  window.Course = {
    chart: chart, load: load, colors: colors, toast: toast, el: el,
    stepper: initStepper, theme: effectiveTheme,
    onThemeChange: function (fn) { themeListeners.push(fn); },
    chapters: chapters, byId: byId, href: href,
    ready: function (fn) {
      if (booted) fn(); else document.addEventListener("course:ready", fn);
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
