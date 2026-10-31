/* Abhidhamma Atlas: the concept map, made clickable.
   Draws every svg.cmap (the main map on the "map" page and the small maps on the level
   pages), the idea index, and the link matrix and list. On screen the main map is a
   navigator: choose an idea or an arrow, walk from idea to idea, or trace the shortest
   chain between two ideas. Deep links work from anywhere in the atlas:
   #idea-KA (an idea), #link-14 (a link, by its index in data.js), #path-JV-NB, #loop-life.
   Every change is announced as an "atlas:select" event, which the 3D map follows. */
(function () {
  "use strict";
  function A(o) { var s = ""; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += " " + k + '="' + o[k] + '"'; return s; }
  function T(tag, o, inner) { return inner === undefined ? "<" + tag + A(o) + "/>" : "<" + tag + A(o) + ">" + inner + "</" + tag + ">"; }
  function $(id) { return document.getElementById(id); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function xr(n) { return '<a class="xr" href="#p' + n + '">→ ' + n + "</a>"; }
  function lvc(n) { return "var(--lv" + n + ")"; }
  function short(t) { return t.split(" · ")[0]; }
  var ROM = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
  var HALO = "paint-order:stroke;stroke:var(--sheet);stroke-width:3px;stroke-linejoin:round";

  var D = window.ATLAS, IDEAS = D.ideas, LINKS = D.links, LTYPE = D.linkTypes, LOOPS = D.loops, LV = D.levels, TH = D.threads;
  var byId = {}; IDEAS.forEach(function (n) { byId[n.id] = n; });
  var ROWS = [46, 140, 250, 355, 460, 565];

  /* ---------------- geometry ---------------- */
  function edgePoint(n, tx, ty) {
    var cx = n.map.x, cy = n.map.y, dx = tx - cx, dy = ty - cy;
    var sx = dx ? (n.map.w / 2 + 3) / Math.abs(dx) : Infinity, sy = dy ? 23 / Math.abs(dy) : Infinity, k = Math.min(sx, sy);
    return [cx + dx * k, cy + dy * k];
  }
  /* Links with map: null get a gentle curve, drawn only when they are in focus. */
  function geom(l) {
    if (l.map) return l.map;
    if (l._auto) return l._auto;
    var a = byId[l.from].map, b = byId[l.to].map;
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1, off = Math.min(80, 26 + len * 0.1);
    var cx = Math.max(20, Math.min(660, (a.x + b.x) / 2 + dy / len * off)), cy = (a.y + b.y) / 2 - dx / len * off;
    var p0 = edgePoint(byId[l.from], cx, cy), p1 = edgePoint(byId[l.to], cx, cy);
    l._auto = { d: "M" + f1(p0[0]) + " " + f1(p0[1]) + " Q" + f1(cx) + " " + f1(cy) + " " + f1(p1[0]) + " " + f1(p1[1]),
      l: l.label, lx: f1(0.25 * p0[0] + 0.5 * cx + 0.25 * p1[0]), ly: f1(0.25 * p0[1] + 0.5 * cy + 0.25 * p1[1]), a: "middle", auto: 1 };
    return l._auto;
  }

  function mid(g) {
    if (g.lx != null) return [+g.lx, +g.ly];
    var v = g.d.match(/-?[\d.]+/g).map(Number);
    return [(v[0] + v[v.length - 2]) / 2, (v[1] + v[v.length - 1]) / 2 + 4];
  }

  /* ---------------- graph: which links are in focus ---------------- */
  function loopLinks(name) {
    return LINKS.map(function (l, i) { return LOOPS[name].some(function (p) { return p[0] === l.from && p[1] === l.to; }) ? i : -1; }).filter(function (i) { return i >= 0; });
  }
  function focusOf(st) {
    if (!st) return null;
    if (st.path) return st.path.map(function (s) { return s.i; });
    if (st.link != null) return [st.link];
    if (st.idea) return LINKS.map(function (l, i) { return l.from === st.idea || l.to === st.idea ? i : -1; }).filter(function (i) { return i >= 0; });
    if (st.loop) return loopLinks(st.loop);
    return null;
  }
  /* The chain of links from a to b that follows the arrows as far as possible: each step
     along an arrow costs 1, each step read against one costs 3 (Dijkstra over 16 ideas). */
  function trace(a, b) {
    var dist = {}, prev = {}, done = {};
    IDEAS.forEach(function (n) { dist[n.id] = Infinity; });
    dist[a] = 0;
    for (;;) {
      var cur = null;
      IDEAS.forEach(function (n) { if (!done[n.id] && dist[n.id] < Infinity && (cur === null || dist[n.id] < dist[cur])) cur = n.id; });
      if (cur === null || cur === b) break;
      done[cur] = true;
      LINKS.forEach(function (l, i) {
        var nx = l.from === cur ? l.to : (l.to === cur ? l.from : null), fwd = l.from === cur;
        if (!nx || done[nx]) return;
        var d = dist[cur] + (fwd ? 1 : 3) + (l.type === "ana" ? 3 : 0);  /* r2: "analysed into" is taxonomy, not mechanism: use it last */
        if (d < dist[nx]) { dist[nx] = d; prev[nx] = { i: i, fwd: fwd, at: cur }; }
      });
    }
    if (dist[b] === Infinity) return null;
    var out = [], n = b;
    while (prev[n]) { out.unshift({ i: prev[n].i, fwd: prev[n].fwd }); n = prev[n].at; }
    return out;
  }

  /* ---------------- drawing ---------------- */
  var uidN = 0;
  function draw(svg, hl, st, main) {
    var uid = "cm" + (uidN++), focus = focusOf(st), on = {}, lit = {};
    if (focus) focus.forEach(function (i) { on[i] = 1; lit[LINKS[i].from] = 1; lit[LINKS[i].to] = 1; });
    if (st && st.idea) lit[st.idea] = 1;
    var step = {}; if (st && st.path) st.path.forEach(function (s, k) { step[s.i] = k + 1; });
    var mk = function (id, col) { return T("marker", { id: uid + id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, T("path", { d: "M0 0 L10 5 L0 10 z", style: "fill:" + col })); };
    var s = "<defs>" + mk("a", "var(--muted)") + mk("b", "var(--ink)");
    Object.keys(LTYPE).forEach(function (k) { s += mk(k, "var(" + LTYPE[k][0] + ")"); });
    s += "</defs>";
    ROWS.forEach(function (y, i) {
      var lv = i + 1;
      var fill = hl === lv ? "fill:color-mix(in srgb, var(--lv" + lv + ") 14%, transparent)" : (lv % 2 ? "fill:var(--faint)" : "fill:none");
      s += T("rect", { x: 0, y: y - 36, width: 680, height: 72, rx: 6, style: fill });
      if (main) s += T("text", { x: 17, y: y - 25, "class": "tx-xs tx-mu tx-b" }, ROM[lv]);
    });
    var labels = "";
    LINKS.forEach(function (l, i) {
      var g = geom(l), isOn = !!on[i];
      if (g.auto && !isOn) return;
      var strong, dim, col, m, w;
      if (focus) { strong = isOn; dim = !isOn; col = isOn ? "var(" + LTYPE[l.type][0] + ")" : "var(--muted)"; m = isOn ? l.type : "a"; w = isOn ? 2.3 : 1.1; }
      else {
        strong = !hl || byId[l.from].lv === hl || byId[l.to].lv === hl;
        dim = hl && !strong && !(byId[l.from].lv < hl && byId[l.to].lv < hl);
        col = hl && strong ? "var(--ink)" : "var(--muted)"; m = hl && strong ? "b" : "a"; w = hl && strong ? 1.6 : 1.2;
      }
      var vis = T("path", { d: g.d, style: "fill:none;stroke:" + col + ";stroke-width:" + w + (dim ? ";opacity:" + (focus ? 0.16 : 0.28) : "") + (g.auto ? ";stroke-dasharray:5 3" : ""),
        "marker-end": "url(#" + uid + m + ")", "marker-start": g.both ? "url(#" + uid + m + ")" : null });
      if (main) {
        s += T("g", { "class": "cme", id: "link-" + i, "data-li": i, role: "button", "aria-label": short(byId[l.from].t) + ", " + l.label + ", " + short(byId[l.to].t) },
          T("path", { d: g.d, "class": "hit" }) + vis + T("title", {}, short(byId[l.from].t) + " → " + l.label + " → " + short(byId[l.to].t)));
      } else s += vis;
      var lbl = g.l || null;
      if (lbl) {
        var cls = "tx-xs" + ((focus ? isOn : hl && strong) ? " tx-b" : " tx-mu");
        var stl = HALO + (dim ? ";opacity:" + (focus ? 0.12 : 0.35) : "");
        if (g.rot) labels += T("text", { x: g.lx, y: g.ly, transform: "rotate(-90 " + g.lx + " " + g.ly + ")", "text-anchor": "middle", "class": cls, style: stl }, lbl);
        else lbl.split("\n").forEach(function (ln, k) { labels += T("text", { x: g.lx, y: g.ly + k * 10, "text-anchor": g.a || "middle", "class": cls, style: stl }, ln); });
      }
      if (step[i]) {
        var pm = mid(g), bx = pm[0] + (g.rot ? 10 : (g.a === "end" ? 8 : g.a === "start" ? -8 : 0)), by = pm[1] - (g.rot ? 0 : 13);
        labels += T("circle", { cx: f1(bx), cy: f1(by), r: 7, style: "fill:var(--ink)" }) + T("text", { x: f1(bx), y: f1(by + 3), "text-anchor": "middle", "class": "tx-xs tx-b", style: "fill:var(--sheet)" }, step[i]);
      }
    });
    s += labels;
    IDEAS.forEach(function (n) {
      var state;
      if (focus || (st && st.idea)) state = st.idea === n.id ? "hl" : (lit[n.id] ? "full" : "dim");
      else state = !hl ? "full" : (hl === 7 ? "full" : (n.lv === hl ? "hl" : (n.lv < hl ? "past" : "future")));
      var x = n.map.x - n.map.w / 2, y = n.map.y - 20, c = lvc(n.lv), sub = n.s + " · pl. " + n.p.join(", "), g = "";
      if (state === "hl") {
        g += T("rect", { x: x, y: y, width: n.map.w, height: 40, rx: 6, "class": "bx", style: "fill:" + c + ";stroke:" + c });
        g += T("text", { x: x + 11, y: n.map.y - 3, "class": "tx-m tx-b", style: "fill:var(--on-lv)" }, n.t);
        g += T("text", { x: x + 11, y: n.map.y + 11, "class": "tx-xs", style: "fill:var(--on-lv);opacity:.85" }, sub);
      } else {
        g += T("rect", { x: x, y: y, width: n.map.w, height: 40, rx: 6, "class": "bx", style: "fill:var(--sheet);stroke:" + c + ";stroke-width:1.3" });
        g += T("rect", { x: x, y: y, width: 5, height: 40, rx: 2, style: "fill:" + c });
        g += T("text", { x: x + 12, y: n.map.y - 3, "class": "tx-m tx-b" }, n.t);
        g += T("text", { x: x + 12, y: n.map.y + 11, "class": "tx-xs tx-mu" }, sub);
      }
      var op = state === "future" ? "opacity:.3" : (state === "dim" ? "opacity:.28" : "");
      if (main) s += T("g", { "class": "cmn", id: "idea-" + n.id, "data-id": n.id, tabindex: 0, role: "button", "aria-pressed": String(state === "hl"), "aria-label": short(n.t) + ": " + n.d, style: op }, g);
      else s += T("a", { href: "#idea-" + n.id, "aria-label": short(n.t) + " on the main map" }, T("g", { style: op }, g));
    });
    svg.innerHTML = s;
  }

  /* small maps on the level pages: each box opens that idea on the main map */
  each("svg.cmap:not(#cmap-main)", function (svg) {
    var hl = +svg.getAttribute("data-hl");
    draw(svg, hl, null, false);
    /* r2: crop a level page's map to the rows of its level and its neighbours, so the labels stay legible */
    if (hl >= 1 && hl <= 6) {
      var y0 = ROWS[Math.max(0, hl - 2)] - 40, y1 = hl < 6 ? ROWS[hl] + 26 : ROWS[5] + 40;
      svg.setAttribute("viewBox", "0 " + y0 + " 680 " + (y1 - y0));
    }
  });

  /* ---------------- the idea index on the 3D page ---------------- */
  (function () {
    var host = $("m3-nodes"); if (!host) return;
    host.innerHTML = IDEAS.map(function (n) {
      return '<div><span class="dotlv" style="background:var(--lv' + n.lv + ')"></span><a class="ilink" href="#idea-' + n.id + '"><b>' + n.t + "</b></a> " + n.d + " " + n.p.map(xr).join(" ") + "</div>";
    }).join("");
  })();

  /* ---------------- a small drawing for each idea (viewBox 140 × 84) ----------------
     The form follows the idea: strips of moments for processes, structures for things,
     stacks and bars for counts. Shared by the described-ideas pages and the map's panel. */
  function ideaGlyph(id) {
    var s = "", t = function (x, y, txt, cls, extra) { return T("text", Object.assign({ x: x, y: y, "class": "tx-xs " + (cls || "") }, extra || {}), txt); };
    function cells(x, y, keys, w, h, gap) {
      var F = { l: "fill:var(--faint);stroke:var(--line)", v: "fill:var(--line);stroke:var(--line)", a: "fill:var(--nama-soft);stroke:var(--nama-2)", s: "fill:var(--sheet);stroke:var(--nama);stroke-width:1.4",
        j: "fill:var(--nama);stroke:var(--nama)", r: "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:2 1.5", d: "fill:var(--muted);stroke:var(--muted)", p: "fill:var(--kamma);stroke:var(--kamma)",
        g: "fill:var(--nama-2);stroke:var(--nib);stroke-width:1.3", m: "fill:var(--nib);stroke:var(--nib)", f: "fill:var(--nib-soft);stroke:var(--nib)", k: "fill:var(--nama-2);stroke:var(--nama-2)" };
      var o = "";
      keys.split("").forEach(function (k, i) { o += T("rect", { x: f1(x + i * (w + gap)), y: y, width: w, height: h, rx: 1.5, style: F[k] }); });
      return o;
    }
    switch (id) {
      case "T":
        s += T("rect", { x: 30, y: 4, width: 80, height: 22, rx: 11, style: "fill:none;stroke:var(--muted);stroke-dasharray:3 2" });
        s += t(70, 19, "“a person”", "tx-it", { "text-anchor": "middle" });
        s += T("path", { d: "M70 28 L70 40", style: "stroke:var(--muted);stroke-width:1.2" }) + T("path", { d: "M66 36 L70 41 L74 36", style: "fill:none;stroke:var(--muted);stroke-width:1.2" });
        [["citta", "--nama"], ["cetasika", "--nama-2"], ["rūpa", "--rupa-mark"], ["Nibbāna", "--nib"]].forEach(function (r, i) {
          s += T("rect", { x: 4 + i * 34, y: 46, width: 30, height: 18, rx: 3, style: "fill:var(" + r[1] + ")" }) + t(19 + i * 34, 76, r[0], "tx-mu", { "text-anchor": "middle" });
        });
        s += t(136, 15, "sammuti", "tx-it tx-mu", { "text-anchor": "end" }) + t(136, 43, "paramattha", "tx-it tx-mu", { "text-anchor": "end" });
        break;
      case "CE":
        s += T("circle", { cx: 70, cy: 42, r: 13, style: "fill:var(--nama)" }) + t(70, 45, "citta", "", { "text-anchor": "middle", style: "fill:var(--on-accent)" });
        for (var i = 0; i < 7; i++) { var a = i / 7 * 6.283 - 1.57; s += T("circle", { cx: f1(70 + 24 * Math.cos(a)), cy: f1(42 + 24 * Math.sin(a)), r: 3.2, style: "fill:var(--nama-2)" }); }
        for (i = 0; i < 12; i++) { a = i / 12 * 6.283; s += T("circle", { cx: f1(70 + 36 * Math.cos(a)), cy: f1(42 + 36 * Math.sin(a)), r: 2.4, style: "fill:none;stroke:var(--nama-2);stroke-width:1" }); }
        s += t(138, 10, "7 always", "tx-mu", { "text-anchor": "end" }) + t(138, 82, "others as fit", "tx-mu", { "text-anchor": "end" });
        break;
      case "CI":
        for (i = 0; i < 5; i++) {
          var x = 6 + i * 27;
          s += T("rect", { x: x, y: 30, width: 6, height: 22, style: "fill:var(--nama-soft)" }) + T("rect", { x: x + 6, y: 30, width: 9, height: 22, style: "fill:var(--nama)" }) + T("rect", { x: x + 15, y: 30, width: 6, height: 22, style: "fill:var(--nama-2)" });
          if (i < 4) s += T("path", { d: "M" + (x + 22) + " 41 L" + (x + 26) + " 41", style: "stroke:var(--muted)" });
        }
        s += t(9, 24, "arise · stand · cease", "tx-mu") + t(70, 68, "santati: a series, no owner", "tx-it", { "text-anchor": "middle" });
        break;
      case "RU":
        var EL = [["earth", 0], ["water", 1], ["fire", 2], ["air", 3]];
        EL.forEach(function (e, i) { var a = i / 4 * 6.283 - 0.785; s += T("circle", { cx: f1(52 + 15 * Math.cos(a)), cy: f1(42 + 15 * Math.sin(a)), r: 7, style: "fill:var(--rupa-mark)" }); });
        for (i = 0; i < 4; i++) { a = i / 4 * 6.283; s += T("circle", { cx: f1(52 + 31 * Math.cos(a)), cy: f1(42 + 31 * Math.sin(a)), r: 4, style: "fill:var(--rupa-soft);stroke:var(--rupa)" }); }
        s += t(92, 36, "4 great", "tx-b") + t(92, 47, "elements", "") + t(92, 60, "+ colour, smell,", "tx-mu") + t(92, 70, "taste, nutriment", "tx-mu");
        break;
      case "NB":
        ["form", "feel.", "perc.", "form.", "cons."].forEach(function (k, i) { s += T("rect", { x: 4 + i * 17, y: 30, width: 15, height: 24, rx: 2, style: "fill:var(--faint);stroke:var(--line)" }) + t(11.5 + i * 17, 64, k, "tx-mu", { "text-anchor": "middle", style: "font-size:6px" }); });
        s += t(46, 22, "five aggregates", "tx-mu", { "text-anchor": "middle" });
        s += T("circle", { cx: 116, cy: 42, r: 17, style: "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1.6" }) + t(116, 45, "santi", "tx-it tx-nb", { "text-anchor": "middle" });
        s += t(116, 74, "unconditioned", "tx-nb", { "text-anchor": "middle" });
        break;
      case "BH":
        s += cells(4, 34, "lllllvvaasssjjjrrlllll", 5, 14, 1);
        s += t(4, 26, "life-continuum", "tx-mu") + t(70, 64, "interrupted, then resumes", "tx-mu", { "text-anchor": "middle" });
        s += t(70, 78, "same citta as rebirth-linking", "tx-it", { "text-anchor": "middle" });
        break;
      case "PR":
        s += T("rect", { x: 4, y: 24, width: 132, height: 4, rx: 2, style: "fill:var(--rupa-mark)" }) + t(4, 18, "the object: 17 moments of matter", "tx-mu");
        s += cells(4, 34, "lvvasaaajjjjjjjrr", 6.8, 14, 0.9);
        s += t(70, 64, "adverting, seeing … javana", "tx-mu", { "text-anchor": "middle" }) + t(70, 77, "citta-niyāma: a fixed order", "tx-it", { "text-anchor": "middle" });
        break;
      case "JV":
        s += cells(4, 34, "lvvasaaajjjjjjjrr", 6.8, 14, 0.9);
        s += T("path", { d: "M80 50 C80 66, 112 66, 118 70", style: "fill:none;stroke:var(--kamma);stroke-width:1.4" }) + T("circle", { cx: 121, cy: 71, r: 4, style: "fill:var(--kamma)" });
        s += t(96, 27, "7 javanas", "tx-b", { "text-anchor": "middle" }) + t(110, 82, "kamma", "tx-b", { style: "fill:var(--kamma)" }) + t(4, 74, "only here is kamma made", "tx-mu");
        break;
      case "CO":
        var P = [[22, 22], [70, 12], [118, 26], [40, 66], [100, 66]], E = [[0, 1, "--nama"], [1, 2, "--nama"], [0, 3, "--rupa-mark"], [3, 4, "--nama-2"], [4, 2, "--kamma"], [1, 4, "--nib"], [3, 1, "--muted"], [2, 0, "--nama-2"]];
        E.forEach(function (e) { var a = P[e[0]], b = P[e[1]]; s += T("path", { d: "M" + a[0] + " " + a[1] + " L" + b[0] + " " + b[1], style: "stroke:var(" + e[2] + ");stroke-width:1.3" }); });
        P.forEach(function (p) { s += T("circle", { cx: p[0], cy: p[1], r: 5, style: "fill:var(--sheet);stroke:var(--ink);stroke-width:1.2" }); });
        s += t(70, 82, "held by many conditions", "tx-mu", { "text-anchor": "middle" });
        break;
      case "DO":
        for (i = 0; i < 12; i++) { a = i / 12 * 6.283 - 1.57; var hl = i === 0 || i === 7;
          s += T("circle", { cx: f1(46 + 30 * Math.cos(a)), cy: f1(42 + 30 * Math.sin(a)), r: hl ? 5 : 3.4, style: "fill:" + (hl ? "var(--bad)" : "var(--nama-2)") }); }
        s += T("path", { d: "M46 6 A36 36 0 1 1 12 32", style: "fill:none;stroke:var(--muted);stroke-dasharray:2 2" });
        s += t(86, 30, "12 links,", "tx-b") + t(86, 41, "3 lives", "") + t(86, 56, "roots:", "tx-mu") + t(86, 66, "ignorance (1)", "tx-bd") + t(86, 76, "craving (8)", "tx-bd");
        break;
      case "RB":
        s += cells(4, 34, "jjjjjrd", 8, 14, 1) + cells(67, 34, "plllll", 8, 14, 1);
        s += T("path", { d: "M63 30 L63 52", style: "stroke:var(--ink);stroke-width:1.2" });
        s += t(4, 26, "last process", "tx-mu") + t(67, 26, "next life", "tx-mu");
        s += t(52, 64, "death", "", { "text-anchor": "middle" }) + t(71, 64, "rebirth-linking", "", { style: "fill:var(--kamma)" });
        s += t(70, 79, "na ca so na ca añño", "tx-it", { "text-anchor": "middle" });
        break;
      case "PL":
        [[4, "--bad", "4 woeful"], [7, "--nama-2", "7 happy sense-sphere"], [16, "--g2", "16 fine-material"], [4, "--nib", "4 immaterial"]].reverse().forEach(function (r, i, arr) {
          var y = 6 + i * 19; s += T("rect", { x: 4, y: y, width: f1(r[0] * 4.2), height: 14, rx: 2, style: "fill:var(" + r[1] + ")" }) + t(f1(8 + r[0] * 4.2), y + 10, r[2], "");
        });
        break;
      case "KA":
        s += T("path", { d: "M8 50 L132 50", style: "stroke:var(--line);stroke-width:1.2" });
        s += T("circle", { cx: 16, cy: 50, r: 5, style: "fill:var(--kamma)" }) + t(16, 66, "volition", "", { "text-anchor": "middle" });
        [[62, "this life"], [96, "next"], [128, "later"]].forEach(function (r) { s += T("path", { d: "M18 46 Q" + f1((18 + r[0]) / 2) + " 14 " + r[0] + " 44", style: "fill:none;stroke:var(--kamma);stroke-dasharray:2 2" }) + T("rect", { x: r[0] - 4, y: 45, width: 8, height: 10, rx: 1.5, style: "fill:var(--nama-soft);stroke:var(--nama)" }) + t(r[0], 66, r[1], "tx-mu", { "text-anchor": "middle" }); });
        s += t(70, 80, "it ripens as result (vipāka)", "tx-it", { "text-anchor": "middle" });
        break;
      case "SA":
        [5, 4, 3, 2, 2].forEach(function (n, i) { s += T("rect", { x: 10 + i * 25, y: 68 - n * 11, width: 18, height: n * 11, rx: 2, style: "fill:var(--nama-2)" }) + t(19 + i * 25, 78, i + 1, "tx-mu", { "text-anchor": "middle" }); });
        s += t(70, 9, "jhāna factors, floor by floor", "tx-mu", { "text-anchor": "middle" });
        break;
      case "VI":
        s += cells(4, 18, "kkkkkkkk", 10, 12, 4);
        for (i = 0; i < 8; i++) s += T("rect", { x: 4 + i * 14, y: 18, width: 10, height: 12, rx: 1.5, style: "fill:var(--sheet);opacity:" + f1(i % 2 ? 0.75 : 0.15) });
        s += t(4, 12, "rise and fall", "tx-mu");
        [["anicca", 12, 52], ["dukkha", 58, 52], ["anattā", 104, 52]].forEach(function (m) { s += T("rect", { x: m[1] - 6, y: m[2] - 10, width: 44, height: 15, rx: 7, style: "fill:none;stroke:var(--nib)" }) + t(m[1] + 16, m[2], m[0], "tx-it tx-nb", { "text-anchor": "middle" }); });
        s += t(70, 76, "the three marks, seen directly", "tx-mu", { "text-anchor": "middle" });
        break;
      case "PA":
        s += cells(4, 22, "kkkgmff", 15, 15, 2);
        s += t(4, 15, "conformity", "tx-mu") + t(55, 50, "change-of-lineage", "tx-mu") + t(72, 15, "path", "tx-nb tx-b") + t(110, 15, "fruit", "tx-nb");
        [3, 0, 2, 5].forEach(function (n, i) { for (var k = 0; k < n; k++) s += T("path", { d: "M" + (8 + i * 34 + k * 5) + " 60 l4 10 M" + (12 + i * 34 + k * 5) + " 60 l-4 10", style: "stroke:var(--bad);stroke-width:1.2" }); s += t(8 + i * 34, 82, ["stream", "once", "non-ret.", "arahant"][i], "tx-mu"); });
        break;
    }
    return '<svg class="ig" viewBox="0 0 140 84" aria-hidden="true">' + s + "</svg>";
  }
  window.ATLAS.ideaGlyph = ideaGlyph;

  /* ---------------- a literal picture for each idea (viewBox 180 × 112) ----------------
     Each scene is the image the texts themselves use. Static state = complete, printable picture.
     animatePicture(svgEl, id) replays the teaching motion and ends in that same static state. */
  var PIC = (function () {
    var INK = "stroke:var(--ink);stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round";
    function P(d, fill, extra) { return T("path", { d: d, style: INK + ";fill:" + (fill || "none") + (extra ? ";" + extra : "") }); }
    function C(x, y, r, fill, extra) { return T("circle", { cx: x, cy: y, r: r, style: INK + ";fill:" + (fill || "none") + (extra ? ";" + extra : "") }); }
    function R(x, y, w, h, fill, extra, rx) { return T("rect", { x: x, y: y, width: w, height: h, rx: rx || 0, style: INK + ";fill:" + (fill || "none") + (extra ? ";" + extra : "") }); }
    function E(x, y, rx, ry, fill, extra) { return T("ellipse", { cx: x, cy: y, rx: rx, ry: ry, style: INK + ";fill:" + (fill || "none") + (extra ? ";" + extra : "") }); }
    function L(x, y, s, cls, anchor, style) { var a = { x: x, y: y, "class": cls || "tx-xs" }; if (anchor) a["text-anchor"] = anchor; if (style) a.style = style; return T("text", a, s); }
    function G(n, inner) { return T("g", { "data-g": n }, inner); }
    function ground(y) { return P("M6 " + y + " L174 " + y, "none", "stroke:var(--muted)"); }
    function fig(x, y, s, fill, crown) {
      var o = P("M" + (x - 5 * s) + " " + y + " L" + (x - 3.5 * s) + " " + (y - 12 * s) + " Q" + x + " " + (y - 14 * s) + " " + (x + 3.5 * s) + " " + (y - 12 * s) + " L" + (x + 5 * s) + " " + y + " Z", fill || "var(--nama-soft)");
      o += P("M" + (x - 3.5 * s) + " " + (y - 11 * s) + " l" + (-2 * s) + " " + (5 * s) + " M" + (x + 3.5 * s) + " " + (y - 11 * s) + " l" + (2 * s) + " " + (5 * s), "none");
      o += C(x, y - 16.5 * s, 3.6 * s, "var(--sheet)");
      if (crown) o += P("M" + (x - 3.4 * s) + " " + (y - 19.5 * s) + " l" + 0.5 * s + " " + -3.5 * s + " l" + 2.9 * s + " " + 2.4 * s + " l" + 2.9 * s + " " + -2.4 * s + " l" + 0.5 * s + " " + 3.5 * s + " Z", "var(--rupa-mark)");
      return o;
    }
    function seated(x, y, s, fill) {
      return P("M" + (x - 14 * s) + " " + y + " Q" + x + " " + (y - 9 * s) + " " + (x + 14 * s) + " " + y + " Z", "var(--faint)") +
        P("M" + (x - 5 * s) + " " + (y - 6 * s) + " Q" + (x - 4 * s) + " " + (y - 19 * s) + " " + x + " " + (y - 19 * s) + " Q" + (x + 4 * s) + " " + (y - 19 * s) + " " + (x + 5 * s) + " " + (y - 6 * s) + " Z", fill || "var(--nama-soft)") +
        C(x, y - 24 * s, 4.4 * s, "var(--sheet)");
    }
    function flame(x, y, h, w, fill, extra) {
      return P("M" + x + " " + y + " C" + (x - w) + " " + (y - h * .3) + " " + (x - w * .4) + " " + (y - h * .7) + " " + x + " " + (y - h) + " C" + (x + w * .4) + " " + (y - h * .7) + " " + (x + w) + " " + (y - h * .3) + " " + x + " " + y + " Z", fill || "var(--f-joy)", extra || "stroke:var(--rupa)");
    }
    function bowl(x, y) {
      return P("M" + (x - 13) + " " + y + " Q" + x + " " + (y + 14) + " " + (x + 13) + " " + y + " Z", "var(--rupa-soft)") +
        P("M" + (x - 4) + " " + (y + 10) + " L" + (x - 7) + " " + (y + 16) + " L" + (x + 7) + " " + (y + 16) + " L" + (x + 4) + " " + (y + 10), "none") +
        P("M" + x + " " + y + " L" + x + " " + (y - 3), "none", "stroke-width:1");
    }
    function arrow(x1, y, x2, extra) { return P("M" + x1 + " " + y + " L" + x2 + " " + y + " M" + (x2 - 3) + " " + (y - 2.6) + " L" + x2 + " " + y + " L" + (x2 - 3) + " " + (y + 2.6), "none", extra || "stroke:var(--muted)"); }
    function mango(x, y, s) {
      return P("M" + x + " " + (y - 5 * s) + " C" + (x + 6 * s) + " " + (y - 6 * s) + " " + (x + 8 * s) + " " + (y + 3 * s) + " " + (x + 1 * s) + " " + (y + 6 * s) + " C" + (x - 6 * s) + " " + (y + 7 * s) + " " + (x - 8 * s) + " " + (y - 3 * s) + " " + x + " " + (y - 5 * s) + " Z", "var(--rupa-mark)", "stroke:var(--rupa)") +
        P("M" + x + " " + (y - 5 * s) + " q" + 2 * s + " " + -3 * s + " " + 5 * s + " " + -3 * s, "none", "stroke:var(--nib)");
    }
    function tree(x, y, fruits) {
      var o = P("M" + (x - 3) + " " + y + " L" + (x - 2) + " " + (y - 30) + " L" + (x + 2) + " " + (y - 30) + " L" + (x + 3) + " " + y + " Z", "var(--rupa-soft)", "stroke:var(--rupa)");
      o += P("M" + x + " " + (y - 22) + " l-8 -8 M" + x + " " + (y - 26) + " l8 -8", "none", "stroke:var(--rupa);stroke-width:2");
      [[-12, -38, 12], [8, -44, 13], [18, -34, 10], [-4, -32, 10]].forEach(function (c) { o += C(x + c[0], y + c[1], c[2], "var(--f-ple)", "stroke:var(--nib)"); });
      (fruits || []).forEach(function (f) { o += mango(x + f[0], y + f[1], .75); });
      return o;
    }
    var N = ["ignorance", "formations", "consciousness", "mind-body", "six bases", "contact", "feeling", "craving", "clinging", "becoming", "birth", "old age, death"];
    var AGG = ["form", "feeling", "perception", "formations", "consciousness"];
    var D = {
      /* T: Vajirā's chariot, labelled parts */
      T: function () {
        var o = ground(98) + G("title", L(90, 10, "“chariot” is only these parts", "tx-xs tx-it", "middle"));
        o += G("axle", P("M42 80 L98 80", "none", "stroke:var(--rupa);stroke-width:3.4") + L(40, 83, "axle", "tx-xs", "end"));
        var w = C(70, 80, 17, "var(--sheet)") + C(70, 80, 3.4, "var(--ink)");
        for (var i = 0; i < 8; i++) { var a = i * .785; w += P("M" + (70 + 3.4 * Math.cos(a)).toFixed(1) + " " + (80 + 3.4 * Math.sin(a)).toFixed(1) + " L" + (70 + 17 * Math.cos(a)).toFixed(1) + " " + (80 + 17 * Math.sin(a)).toFixed(1), "none", "stroke:var(--rupa)"); }
        o += G("wheel", w + C(70, 80, 14.5, "none", "stroke:var(--rupa);stroke-width:.8") + L(70, 108, "wheel", "tx-xs", "middle"));
        o += G("box", P("M50 60 L50 46 Q50 42 55 42 L95 42 L101 52 L101 60 Z", "var(--rupa-soft)") + P("M50 52 L99 52", "none", "stroke:var(--rupa);stroke-width:.8") + L(76, 37, "box", "tx-xs", "middle"));
        o += G("pole", P("M101 56 L150 70", "none", "stroke:var(--rupa);stroke-width:3") + P("M150 62 L150 79", "none", "stroke:var(--rupa);stroke-width:2.4") + L(128, 58, "pole", "tx-xs", "middle"));
        o += G("banner", P("M58 42 L58 22", "none") + P("M58 22 L74 26 L58 31 Z", "var(--rupa-mark)") + L(55, 20, "banner", "tx-xs", "end"));
        return o;
      },
      /* CE: the king and his retinue */
      CE: function () {
        var o = L(90, 10, "citta the king, cetasikas his court", "tx-xs tx-it", "middle") + ground(98);
        o += P("M72 44 Q90 28 108 44 Z", "var(--rupa-soft)", "stroke:var(--rupa)") + P("M90 36 L90 70", "none", "stroke:var(--rupa)");
        o += R(68, 86, 44, 12, "var(--rupa-soft)", "stroke:var(--rupa)") + R(74, 78, 32, 8, "var(--faint)");
        o += fig(90, 82, 1.8, "var(--nama)", true);
        var xs = [16, 30, 44, 128, 142, 156, 168];
        xs.forEach(function (x, i) { o += G("r" + i, fig(x, 98 - (i % 2) * 2, .95, "var(--nama-soft)")); });
        o += G("cnt", L(36, 108, "cetasikas", "tx-xs", "middle", "fill:var(--nama)") + L(148, 108, "7 always attend", "tx-xs", "middle", "fill:var(--nama)")) + L(90, 108, "citta", "tx-xs", "middle");
        return o;
      },
      /* CI: arise, stand, dissolve */
      CI: function () {
        var o = L(90, 10, "one mind-moment, three instants", "tx-xs tx-it", "middle");
        var ph = [[30, "arising", "uppāda"], [90, "standing", "ṭhiti"], [150, "dissolving", "bhaṅga"]];
        ph.forEach(function (p, i) {
          var x = p[0], f = "";
          if (i === 0) f = flame(x, 67, 9, 3) + C(x + 4, 52, 1, "var(--f-joy)", "stroke:none") + C(x - 3, 49, .8, "var(--f-joy)", "stroke:none");
          if (i === 1) f = C(x, 55, 15, "var(--f-joy)", "stroke:none;opacity:.25") + flame(x, 67, 25, 8) + flame(x, 67, 11, 3.2, "var(--sheet)", "stroke:none");
          if (i === 2) f = flame(x, 67, 14, 4.5, "none", "stroke:var(--rupa);stroke-dasharray:2 1.6") + P("M" + x + " 50 q-4 -4 0 -8 q4 -4 0 -8", "none", "stroke:var(--muted);stroke-dasharray:1.5 2");
          o += G("p" + i, f + bowl(x, 70) + L(x, 98, p[1], "tx-xs", "middle") + L(x, 105, p[2], "tx-xs tx-it tx-mu", "middle"));
        });
        o += arrow(48, 60, 70) + arrow(108, 60, 130) + L(60, 40, "", "tx-xs");
        return o;
      },
      /* RU: four great elements and their qualities */
      RU: function () {
        var o = L(90, 10, "four elements, never found apart", "tx-xs tx-it", "middle");
        var cx = [24, 68, 112, 156];
        var ic = [
          P("M15 42 L19 30 L30 28 L34 36 L32 44 L18 45 Z", "var(--rupa-soft)", "stroke:var(--rupa)") + P("M22 31 L25 38 L31 40", "none", "stroke:var(--muted);stroke-width:.8"),
          P("M68 26 C74 34 76 38 76 41 A8 8 0 0 1 60 41 C60 38 62 34 68 26 Z", "var(--water)", "stroke:var(--nib);opacity:.85"),
          flame(112, 45, 20, 7),
          P("M96 30 q8 -5 14 0 t12 0 M98 37 q10 -5 16 0 t10 0 M100 44 q8 -5 12 0 t10 0", "none", "stroke:var(--muted)")
        ];
        ic[3] = P("M144 30 q8 -5 14 0 t10 0 M146 37 q10 -5 16 0 t8 0 M148 44 q8 -5 12 0 t10 0", "none", "stroke:var(--muted)");
        var nm = ["earth", "water", "fire", "air"], q1 = ["hardness", "cohesion", "heat", "motion"], q2 = ["supports", "binds", "ripens", "pushes"];
        for (var i = 0; i < 4; i++) o += G("e" + i, ic[i] + L(cx[i], 55, nm[i], "tx-xs", "middle", "font-weight:700") + L(cx[i], 62, q1[i], "tx-xs", "middle") + L(cx[i], 69, "(" + q2[i] + ")", "tx-xs tx-it tx-mu", "middle"));
        o += T("rect", { x: 40, y: 76, width: 100, height: 22, rx: 11, style: "fill:none;stroke:var(--muted);stroke-dasharray:3 2" });
        var cl = ["var(--rupa-soft)", "var(--water)", "var(--f-joy)", "var(--faint)"];
        o += G("kal", cl.map(function (c, i) { return C(66 + i * 16, 87, 5, c, "stroke:var(--ink)"); }).join(""));
        o += L(90, 107, "one grain of matter holds all four: a kalāpa", "tx-xs tx-it", "middle");
        return o;
      },
      /* NB: a lamp gone out */
      NB: function () {
        var o = L(90, 10, "like a flame gone out", "tx-xs tx-it", "middle") + ground(98);
        o += bowl(48, 76) + R(34, 94, 28, 4, "var(--rupa-soft)");
        o += T("path", { d: "M36 77 Q48 82 60 77", style: "fill:none;stroke:var(--muted);stroke-dasharray:2 2" });
        o += P("M48 73 q-5 -8 0 -15 q5 -7 0 -15", "none", "stroke:var(--muted);stroke-dasharray:2 2");
        o += G("dirs", [[14, 30], [30, 20], [66, 20], [82, 30]].map(function (p, i) {
          return P("M48 62 L" + p[0] + " " + p[1], "none", "stroke:var(--muted);stroke-dasharray:1.5 2.5") + P("M" + (p[0] - 3) + " " + (p[1] - 3) + " l6 6 m0 -6 l-6 6", "none", "stroke:var(--bad);stroke-width:1.6");
        }).join(""));
        o += L(48, 108, "no fuel: craving spent", "tx-xs", "middle");
        o += L(138, 44, "not gone east or west,", "tx-xs", "middle") + L(138, 52, "not gone anywhere;", "tx-xs", "middle") + L(138, 62, "just no more arising.", "tx-xs tx-nb", "middle");
        o += P("M104 72 L172 72", "none", "stroke:var(--line)") + L(138, 84, "nibbāna: the quenching", "tx-xs tx-it", "middle");
        return o;
      },
      /* BH: stream of bhavaṅga and a leaf */
      BH: function () {
        var o = L(90, 10, "bhavaṅga: the stream flows on", "tx-xs tx-it", "middle");
        o += T("rect", { x: 0, y: 40, width: 180, height: 46, style: "fill:var(--nama-soft)" });
        o += P("M0 40 L180 40 M0 86 L180 86", "none", "stroke:var(--muted)");
        for (var r = 0; r < 3; r++) for (var i = 0; i < 4; i++) o += P("M" + (6 + i * 44 + r * 14) + " " + (50 + r * 14) + " q6 -3 12 0 t12 0", "none", "stroke:var(--water)");
        o += arrow(8, 94, 40, "stroke:var(--nib)") + L(46, 96, "flows on", "tx-xs tx-nb");
        o += P("M120 40 L150 40", "none") + P("M126 16 Q142 12 160 18", "none", "stroke:var(--rupa);stroke-width:2.6");
        o += G("rip", E(90, 64, 7, 3, "none", "stroke:var(--nib)") + E(90, 64, 14, 6, "none", "stroke:var(--nib);opacity:.7") + E(90, 64, 22, 9, "none", "stroke:var(--nib);opacity:.45"));
        o += G("leaf", P("M82 62 Q90 54 98 62 Q90 68 82 62 Z", "var(--f-ple)", "stroke:var(--nib)") + P("M82 62 L98 62", "none", "stroke:var(--nib);stroke-width:.8"));
        o += L(90, 31, "object touches: a ripple (vibration)", "tx-xs", "middle") + L(138, 106, "then it settles", "tx-xs tx-mu", "middle");
        return o;
      },
      /* PR: mango falls on the sleeper; seven counted moments */
      PR: function () {
        var o = ground(98), w = ["shake", "cut", "turn", "hear", "take", "weigh", "fix"];
        for (var i = 0; i < 7; i++) {
          var x = 17 + i * 24.3;
          o += G("d" + i, C(x, 18, 4, "var(--nama)", "stroke:var(--nama)") + L(x, 30, w[i], "tx-xs", "middle")) + L(x, 13, "" + (i + 1), "tx-xs tx-mu", "middle");
        }
        o += P("M126 98 L127 70", "none", "stroke:var(--rupa);stroke-width:3.4");
        [[-12, -32, 12], [8, -38, 13], [20, -28, 10], [-2, -26, 10]].forEach(function (c) { o += C(127 + c[0], 70 + c[1], c[2], "var(--f-ple)", "stroke:var(--nib)"); });
        o += G("hang", mango(120, 56, .9));
        o += P("M120 62 Q106 80 96 92", "none", "stroke:var(--muted);stroke-dasharray:1.5 2.5");
        o += G("fall", mango(96, 92, .9));
        o += P("M22 94 Q50 86 74 92", "none", "stroke:var(--rupa-soft);stroke-width:5") + P("M26 91 Q50 84 72 90", "none", "stroke:var(--nama);stroke-width:5") + C(24, 86, 4, "var(--sheet)");
        o += L(28, 74, "z z z", "tx-xs tx-it tx-mu") + L(46, 107, "asleep: bhavaṅga", "tx-xs", "middle") + L(112, 107, "a mango falls: thud", "tx-xs", "middle");
        return o;
      },
      /* JV: eating the mango, seven impulsions + two savourings */
      JV: function () {
        var o = ground(98), i;
        for (i = 0; i < 9; i++) { var x = i < 7 ? 14 + i * 12 : 112 + (i - 7) * 12; o += G("d" + i, C(x, 18, 4, i < 7 ? "var(--kamma)" : "var(--nama)", "stroke:" + (i < 7 ? "var(--kamma)" : "var(--nama)"))); }
        o += L(50, 33, "7 impulsions: relishing", "tx-xs", "middle") + L(124, 33, "2 savourings", "tx-xs", "middle") + P("M10 25 L90 25", "none", "stroke:var(--kamma);stroke-width:.8") + P("M108 25 L140 25", "none", "stroke:var(--nama);stroke-width:.8");
        o += seated(60, 96, 1.5) + P("M66 76 Q76 70 82 62", "none", "stroke-width:2.2");
        o += G("mg", mango(88, 58, 1.6));
        o += tree(150, 98, [[-6, -34], [8, -40]]) + L(150, 108, "same fruit, now eaten", "tx-xs tx-it", "middle") + L(52, 108, "awake", "tx-xs", "middle");
        return o;
      },
      /* CO: two sheaves of reeds */
      CO: function () {
        var o = L(90, 10, "each stands only by the other", "tx-xs tx-it", "middle") + ground(98), i;
        function sh(bx, dir, col) {
          var s = "";
          for (i = 0; i < 6; i++) { var off = (i - 2.5) * 3.2; s += P("M" + (bx + off) + " 98 Q" + (bx + dir * 20 + off * .6) + " 66 " + (90 - dir * 2.5 + off * .3) + " " + (38 + Math.abs(off)), "none", "stroke:" + col + ";stroke-width:1.5"); }
          s += P("M" + (bx + dir * 14 - 8) + " 70 L" + (bx + dir * 14 + 8) + " 66", "none", "stroke:var(--kamma);stroke-width:2.4");
          return s;
        }
        o += G("L", sh(54, 1, "var(--nama)")) + G("R", sh(126, -1, "var(--rupa)"));
        o += L(54, 108, "nāma", "tx-xs", "middle", "fill:var(--nama);font-weight:700") + L(126, 108, "rūpa", "tx-xs", "middle", "fill:var(--rupa);font-weight:700");
        o += L(90, 26, "lean", "tx-xs tx-mu", "middle");
        return o;
      },
      /* DO: the wheel of twelve links */
      DO: function () {
        var o = L(90, 8, "twelve links, no first link", "tx-xs tx-it", "middle"), cx = 90, cy = 57, r = 23, i, sp = "", nd = "", lb = "";
        for (i = 0; i < 12; i++) {
          var a = -Math.PI / 2 + i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
          sp += P("M" + (cx + 4 * c).toFixed(1) + " " + (cy + 4 * s).toFixed(1) + " L" + (cx + r * c).toFixed(1) + " " + (cy + r * s).toFixed(1), "none", "stroke:var(--rupa)");
          nd += G("n" + i, C((cx + r * c).toFixed(1), (cy + r * s).toFixed(1), 3.3, "var(--rupa-mark)", "stroke:var(--rupa)"));
          lb += L((cx + 31 * c).toFixed(1), (cy + 31 * s + 2).toFixed(1), (i + 1) + " " + N[i], "tx-xs", c > .3 ? "start" : c < -.3 ? "end" : "middle");
        }
        o += C(cx, cy, r, "none", "stroke:var(--rupa);stroke-width:1.6") + G("spk", sp + C(cx, cy, 4, "var(--sheet)")) + nd + lb;
        o += L(90, 108, "ignorance → … → death, and round again", "tx-xs tx-mu", "middle");
        return o;
      },
      /* RB: one lamp lit from another */
      RB: function () {
        var o = L(90, 10, "lit from another: not the same, not other", "tx-xs tx-it", "middle") + ground(98);
        o += G("A", flame(50, 67, 9, 3.4) + bowl(50, 70) + L(50, 108, "this life ends", "tx-xs", "middle"));
        o += G("B", flame(130, 67, 18, 6) + bowl(130, 70) + L(130, 108, "a new one arises", "tx-xs", "middle"));
        o += P("M54 56 Q90 18 126 56", "none", "stroke:var(--kamma);stroke-dasharray:3 2") + P("M122 51 L126 56 L120 57", "none", "stroke:var(--kamma)");
        o += L(90, 34, "the flame passes, no thing passes", "tx-xs", "middle", "fill:var(--kamma)");
        o += L(50, 100, "cuti", "tx-xs tx-it tx-mu", "middle") + L(130, 100, "paṭisandhi", "tx-xs tx-it tx-mu", "middle");
        return o;
      },
      /* PL: Mount Meru and the realms */
      PL: function () {
        var o = "";
        o += G("tr", L(110, 16, "brahma worlds", "tx-xs") + P("M104 17 L84 21", "none", "stroke:var(--muted);stroke-dasharray:1.5 2") + L(110, 38, "Tāvatiṃsa, Sakka", "tx-xs") + P("M104 39 L82 42", "none", "stroke:var(--muted);stroke-dasharray:1.5 2"));
        o += E(46, 22, 24, 5, "var(--faint)", "stroke:var(--nib)") + E(40, 14, 14, 4, "var(--faint)", "stroke:var(--nib)");
        o += P("M42 92 L52 92 L74 46 L20 46 Z", "var(--rupa-soft)", "stroke:var(--rupa)");
        o += R(36, 36, 20, 10, "var(--sheet)") + P("M46 36 L46 28 L54 30 L46 32", "none", "stroke:var(--kamma)");
        o += L(110, 60, "four great kings", "tx-xs") + P("M104 61 L66 62", "none", "stroke:var(--muted);stroke-dasharray:1.5 2");
        o += L(110, 82, "humans, animals", "tx-xs") + P("M104 83 L88 90", "none", "stroke:var(--muted);stroke-dasharray:1.5 2");
        o += P("M0 92 Q20 88 42 92 L52 92 Q76 88 100 92 L100 100 L0 100 Z", "var(--nama-soft)", "stroke:var(--water)");
        o += E(14, 91, 12, 3, "var(--rupa-soft)") + E(90, 91, 12, 3, "var(--rupa-soft)");
        o += P("M0 100 L100 100", "none", "stroke:var(--muted)") + P("M10 104 l4 4 l4 -4 M30 104 l4 4 l4 -4 M50 104 l4 4 l4 -4 M70 104 l4 4 l4 -4", "none", "stroke:var(--bad)");
        o += L(110, 106, "hells, below", "tx-xs", "start", "fill:var(--bad)");
        return o;
      },
      /* KA: seed, sprout, sapling, fruiting tree */
      KA: function () {
        var o = L(90, 10, "what is sown is what grows", "tx-xs tx-it", "middle") + ground(88);
        o += G("s0", E(20, 86, 12, 3, "var(--rupa-soft)") + E(20, 83, 3.4, 2.2, "var(--rupa-mark)", "stroke:var(--rupa)") + L(20, 100, "deed = seed", "tx-xs", "middle"));
        o += G("s1", P("M62 88 L62 74", "none", "stroke:var(--nib);stroke-width:1.6") + P("M62 76 q-9 -2 -10 -9 q9 0 10 9 M62 74 q8 -2 9 -9 q-8 0 -9 9", "var(--f-ple)", "stroke:var(--nib)") + L(62, 100, "sprout", "tx-xs", "middle"));
        o += G("s2", P("M104 88 L104 56", "none", "stroke:var(--rupa);stroke-width:2.2") + P("M104 70 q-12 -3 -13 -11 q12 0 13 11 M104 62 q12 -3 13 -11 q-12 0 -13 11 M104 56 q-6 -4 -4 -12 q8 4 4 12", "var(--f-ple)", "stroke:var(--nib)") + L(104, 100, "sapling", "tx-xs", "middle"));
        o += G("s3", tree(152, 88, [[-14, -26], [6, -30], [16, -20]]) + L(152, 100, "fruit = result", "tx-xs", "middle"));
        o += G("ar", arrow(32, 80, 46) + arrow(74, 80, 88) + arrow(118, 80, 132));
        o += L(90, 108, "ripens later, and in kind", "tx-xs tx-mu", "middle");
        return o;
      },
      /* SA: earth kasiṇa to the bright sign */
      SA: function () {
        var o = ground(98);
        o += seated(28, 96, 1.2) + P("M36 70 L128 68", "none", "stroke:var(--muted);stroke-dasharray:2 3");
        o += G("gz", P("M34 72 L130 70", "none", "stroke:var(--nib);stroke-dasharray:2 3"));
        o += G("disc", P("M146 98 L150 80 L154 98", "none", "stroke:var(--rupa)") + C(150, 66, 17, "var(--rupa-soft)", "stroke:var(--rupa)") + C(150, 66, 11, "none", "stroke:var(--rupa);stroke-width:.7") + L(150, 108, "1 the earth disc", "tx-xs", "middle"));
        o += G("b1", C(36, 56, 1.6, "var(--sheet)") + C(40, 48, 2.4, "var(--sheet)") + C(50, 36, 12, "var(--sheet)", "stroke-dasharray:2 2") + C(50, 36, 7, "var(--rupa-soft)", "stroke-dasharray:1.5 1.5") + L(50, 56, "2 mind’s image", "tx-xs", "middle"));
        o += arrow(66, 36, 84, "stroke:var(--muted)");
        var rays = ""; for (var i = 0; i < 10; i++) { var a = i * .628; rays += P("M" + (112 + 12 * Math.cos(a)).toFixed(1) + " " + (36 + 12 * Math.sin(a)).toFixed(1) + " L" + (112 + 17 * Math.cos(a)).toFixed(1) + " " + (36 + 17 * Math.sin(a)).toFixed(1), "none", "stroke:var(--f-joy)"); }
        o += G("b2", G("rays", rays) + C(112, 36, 10, "var(--f-joy)", "stroke:var(--rupa)") + C(112, 36, 5, "var(--sheet)", "stroke:none") + L(112, 58, "3 bright sign", "tx-xs", "middle"));
        return o;
      },
      /* VI: the plantain trunk peeled */
      VI: function () {
        var o = L(90, 9, "peel it: sheath after sheath, no core", "tx-xs tx-it", "middle") + ground(98), i;
        o += P("M70 38 Q50 16 34 26 M70 38 Q90 14 108 24 M70 38 Q70 10 70 8", "none", "stroke:var(--nib);stroke-width:2");
        for (i = 0; i < 5; i++) {
          var y = 44 + i * 11;
          o += G("sh" + i, P("M58 " + y + " Q70 " + (y - 4) + " 82 " + y + " L83 " + (y + 11) + " Q70 " + (y + 7) + " 57 " + (y + 11) + " Z", i % 2 ? "var(--rupa-soft)" : "var(--faint)") + L(53, y + 8, AGG[i], "tx-xs", "end"));
        }
        for (i = 0; i < 5; i++) o += G("rg" + i, C(130, 62, 22 - i * 4.4, i % 2 ? "var(--rupa-soft)" : "var(--faint)", "stroke:var(--rupa);stroke-width:.9"));
        o += C(130, 62, 3, "var(--sheet)", "stroke:var(--muted);stroke-dasharray:1 1.5") + L(130, 94, "cut across: no heartwood", "tx-xs", "middle");
        o += L(70, 108, "five aggregates", "tx-xs tx-mu", "middle");
        return o;
      },
      /* PA: the raft and the far shore */
      PA: function () {
        var o = T("rect", { x: 40, y: 66, width: 100, height: 34, style: "fill:var(--nama-soft)" });
        o += P("M0 66 L40 66 L40 100 L0 100 Z", "var(--rupa-soft)", "stroke:var(--rupa)") + P("M140 66 L180 66 L180 100 L140 100 Z", "var(--f-ple)", "stroke:var(--nib)");
        o += P("M40 66 L140 66", "none", "stroke:var(--muted)") + P("M52 72 q5 -3 10 0 t10 0 M92 74 q5 -3 10 0 t10 0 M60 82 q5 -3 10 0 t10 0", "none", "stroke:var(--water)");
        o += L(6, 60, "this shore", "tx-xs tx-mu") + L(174, 40, "far shore", "tx-xs tx-nb", "end") + L(174, 47, "nibbāna", "tx-xs tx-it tx-nb", "end");
        o += P("M162 66 L162 52 M156 56 Q162 46 168 56", "none", "stroke:var(--nib)");
        o += L(90, 10, "the raft carries you over, then is left", "tx-xs tx-it", "middle");
        var cl = [[65.4, 3], [89.9, 2], [114.4, 5]], k = 0, st = "";
        cl.forEach(function (c) { for (var j = 0; j < c[1]; j++, k++) st += T("circle", { cx: (c[0] + (j - (c[1] - 1) / 2) * 4.4).toFixed(1), cy: 96 - (j % 2) * 3, r: 2, "data-k": k, style: INK + ";fill:var(--rupa-soft);stroke-width:1" }); });
        o += G("stones", st);
        o += L(65, 108, "3 dropped", "tx-xs tx-mu", "middle") + L(90, 108, "2", "tx-xs tx-mu", "middle") + L(115, 108, "5: all ten fetters", "tx-xs tx-mu", "start");
        o += G("raft", R(119, 74, 30, 5, "var(--rupa-soft)", "stroke:var(--rupa)", 2) + P("M124 74 L124 79 M134 74 L134 79 M144 74 L144 79", "none", "stroke:var(--rupa);stroke-width:.8") + fig(134, 74, .9, "var(--nama)") + L(134, 86, "raft = the path", "tx-xs", "middle"));
        return o;
      }
    };
    function pic(id) { return '<svg class="ipic" data-id="' + id + '" viewBox="0 0 180 112" role="img" aria-label="Picture; choose it to play"><title>Choose to play</title>' + (D[id] ? D[id]() : "") + "</svg>"; };
    return pic;
  })();

  /* ---------------- animatePicture(svgEl, id): replay the scene's teaching motion ---------------- */
  var animatePicture = (function () {
    var RM = function () { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); };
    function g(s, n) { return s.querySelector('[data-g="' + n + '"]'); }
    function xf(el, tx, ty, sc, rot, cx, cy) { if (!el) return; cx = cx || 0; cy = cy || 0; el.setAttribute("transform", "translate(" + (cx + tx) + " " + (cy + ty) + ") rotate(" + (rot || 0) + ") scale(" + (sc === undefined ? 1 : sc) + ") translate(" + (-cx) + " " + (-cy) + ")"); }
    function op(el, v) { if (el) el.style.opacity = v; }
    function cl(v, a, b) { return Math.max(0, Math.min(1, (v - a) / (b - a))); }
    function ease(x) { return x * x * (3 - 2 * x); }
    function tmp(s, k, html) { var e = s.querySelector('.tmp[data-k="' + k + '"]'); if (!e) { s.insertAdjacentHTML("beforeend", '<g class="tmp" data-k="' + k + '">' + html + "</g>"); e = s.querySelector('.tmp[data-k="' + k + '"]'); } return e; }
    function sty(a, b, c, d) { return "font-size:5.2px;" + (d || ""); }
    function reset(s) {
      var i, e = s.querySelectorAll("[data-g]"), t = s.querySelectorAll(".tmp");
      for (i = 0; i < e.length; i++) { e[i].removeAttribute("transform"); e[i].style.opacity = ""; }
      for (i = 0; i < t.length; i++) t[i].parentNode.removeChild(t[i]);
    }
    function txt(x, y, s, st) { return T("text", { x: x, y: y, "text-anchor": "middle", "class": "tx-xs", style: st || "" }, s); }
    var A = {
      T: function (s, t) {
        var e = t < .35 ? ease(t / .35) : t < .65 ? 1 : 1 - ease((t - .65) / .35);
        xf(g(s, "wheel"), -22 * e, -4 * e); xf(g(s, "axle"), 0, 14 * e); xf(g(s, "box"), 0, -12 * e); xf(g(s, "pole"), 18 * e, 6 * e); xf(g(s, "banner"), -10 * e, -6 * e);
        op(g(s, "title"), 1 - e);
        tmp(s, "q", txt(90, 10, "where is the “chariot”? only parts", "font-style:italic")).style.opacity = e;
      },
      CE: function (s, t) {
        var n = 0;
        for (var i = 0; i < 7; i++) {
          var e = ease(cl(t, i * .1, i * .1 + .2)); if (e >= 1) n++;
          xf(g(s, "r" + i), (i < 3 ? -70 : 70) * (1 - e), 0); op(g(s, "r" + i), e);
        }
        op(g(s, "cnt"), 0);
        tmp(s, "c", txt(36, 108, "cetasikas", "fill:var(--nama)") + txt(148, 108, n + " of 7 attend", "fill:var(--nama)"));
      },
      CI: function (s, t) {
        var ph = Math.floor(t * 6) % 3;
        for (var i = 0; i < 3; i++) op(g(s, "p" + i), i === ph ? 1 : .22);
      },
      RU: function (s, t) {
        for (var i = 0; i < 4; i++) {
          var u = cl(t, i * .16, i * .16 + .16), pulse = 1 + .35 * Math.sin(u * Math.PI);
          xf(g(s, "e" + i), 0, 0, pulse, 0, [24, 68, 112, 156][i], 42);
        }
        var m = ease(cl(t, .7, 1));
        xf(g(s, "kal"), 0, 0, .2 + .8 * m, 0, 90, 87); op(g(s, "kal"), m);
      },
      NB: function (s, t) {
        var h = 22 * (1 - ease(cl(t, 0, .7))) * (1 + .12 * Math.sin(t * 60));
        tmp(s, "f", h > .5 ? flame(48, 73, h, h * .33) : "");
        var d = g(s, "dirs"); op(d, ease(cl(t, .7, 1)));
        function flame(x, y, hh, w) { return T("path", { d: "M" + x + " " + y + " C" + (x - w) + " " + (y - hh * .3) + " " + (x - w * .4) + " " + (y - hh * .7) + " " + x + " " + (y - hh) + " C" + (x + w * .4) + " " + (y - hh * .7) + " " + (x + w) + " " + (y - hh * .3) + " " + x + " " + y + " Z", style: "fill:var(--f-joy);stroke:var(--rupa);stroke-width:1.2" }); }
      },
      BH: function (s, t) {
        var f = ease(cl(t, 0, .4)), y = -48 * (1 - f);
        xf(g(s, "leaf"), 0, y, 1, (1 - f) * 40, 90, 62);
        var r = g(s, "rip"); var c = r.children;
        for (var i = 0; i < c.length; i++) { var u = cl(t, .4 + i * .12, .75 + i * .08); c[i].style.transformOrigin = "90px 64px"; c[i].style.transform = "scale(" + (u > 0 ? .3 + .7 * ease(u) : 0) + ")"; c[i].style.opacity = u > 0 ? (u < 1 ? 1 : "") : 0; }
        if (t >= .999) for (i = 0; i < c.length; i++) { c[i].style.transform = ""; c[i].style.opacity = ""; }
      },
      PR: function (s, t) {
        var f = ease(cl(t, 0, .25));
        op(g(s, "hang"), f < .02 ? 1 : 0);
        var fl = g(s, "fall"), yy = -34 + 34 * f, xx = 24 - 24 * f;
        xf(fl, xx, yy - (t > .25 && t < .32 ? 6 * Math.sin((t - .25) / .07 * Math.PI) : 0));
        var n = Math.floor(cl(t, .3, .95) * 7.99);
        for (var i = 0; i < 7; i++) op(g(s, "d" + i), t >= .25 && i <= n && t > .3 ? 1 : .15);
        if (t < .3) for (i = 0; i < 7; i++) op(g(s, "d" + i), .15);
        if (n >= 2) tmp(s, "x", txt(24, 70, "!", "font-size:9px;font-weight:700;fill:var(--bad)"));
      },
      JV: function (s, t) {
        var n = Math.floor(t * 9.99), m = g(s, "mg");
        for (var i = 0; i < 9; i++) op(g(s, "d" + i), i <= n ? 1 : .15);
        xf(m, 0, 0, Math.max(.35, 1 - n * .09), 0, 88, 58);
      },
      CO: function (s, t) {
        var L = g(s, "L"), R = g(s, "R");
        var a = ease(cl(t, 0, .22)), b = ease(cl(t, .22, .55)), c = ease(cl(t, .78, .95));
        if (t < .78) { xf(L, -70 * a, 0); op(L, 1 - a); xf(R, 0, 0, 1, -62 * b, 126, 98); }
        else { xf(L, -70 * (1 - c), 0); op(L, c); xf(R, 0, 0, 1, -62 * (1 - c), 126, 98); }
        tmp(s, "m", txt(90, 26, "take one away, the other falls", "font-style:italic;fill:var(--bad)")).style.opacity = cl(t, .45, .6) * (1 - cl(t, .8, .95));
        op(s.querySelectorAll("text")[1], 1 - cl(t, .3, .45));
      },
      DO: function (s, t) {
        var n = Math.floor(cl(t, 0, .96) * 12.99);
        for (var i = 0; i < 12; i++) op(g(s, "n" + i), i <= n ? 1 : .15);
        var sp = g(s, "spk"); if (sp) sp.setAttribute("transform", "rotate(" + (720 * ease(t)) + " 90 57)");
      },
      RB: function (s, t) {
        var A1 = g(s, "A"), B1 = g(s, "B"), a = ease(cl(t, 0, .3)), m = cl(t, .3, .6), b = ease(cl(t, .55, .85)), d = ease(cl(t, .7, 1));
        var fa = g(s, "A").children[0], fb = g(s, "B").children[0];
        if (fa) { fa.style.transformOrigin = "50px 67px"; fa.style.transform = "scale(" + (2 - .05 - d * 1.05 + 0) * (1) + ")"; }
        if (fa) fa.style.transform = "scale(" + (1.9 - 0.9 * ease(cl(t, .7, 1))) + ")";
        if (fb) { fb.style.transformOrigin = "130px 67px"; fb.style.transform = "scale(" + b + ")"; fb.style.opacity = b; }
        if (m > 0 && m < 1) { var x = 54 + 72 * m, y = 56 - 36 * Math.sin(m * Math.PI) + 0; tmp(s, "sp", T("circle", { cx: x, cy: y, r: 2.6, style: "fill:var(--f-joy);stroke:var(--rupa)" })); }
        if (t >= .999 && fa) { fa.style.transform = ""; fb.style.transform = ""; fb.style.opacity = ""; }
      },
      PL: function (s, t) {
        var ys = [106, 83, 60, 38, 16], rows = [], i;
        var u = ease(cl(t, 0, .95)), y = 106 - 90 * u, k = Math.round((106 - y) / 22.5);
        tmp(s, "m", T("circle", { cx: 103, cy: y, r: 3, style: "fill:var(--kamma);stroke:var(--ink)" }));
        var tx = s.querySelectorAll("text");
        for (i = 0; i < tx.length; i++) { var ty = +tx[i].getAttribute("y"); tx[i].style.opacity = Math.abs(ty - y) < 12 ? 1 : .3; }
        if (t >= .999) for (i = 0; i < tx.length; i++) tx[i].style.opacity = "";
        s._pl = tx;
      },
      KA: function (s, t) {
        var at = [.0, .18, .4, .62];
        for (var i = 0; i < 4; i++) {
          var e = ease(cl(t, at[i], at[i] + .22)), cx = [20, 62, 104, 152][i];
          xf(g(s, "s" + i), 0, 0, i === 0 ? 1 : e, 0, cx, 88); op(g(s, "s" + i), i === 0 ? 1 : e);
        }
        op(g(s, "ar"), ease(cl(t, .2, .9)));
      },
      SA: function (s, t) {
        var a = ease(cl(t, 0, .25)), b = ease(cl(t, .3, .55)), c = ease(cl(t, .6, .85));
        var gz = g(s, "gz"); if (gz) { gz.style.opacity = a; }
        xf(g(s, "disc"), 0, 0, 1 + .1 * Math.sin(a * Math.PI), 0, 150, 66);
        xf(g(s, "b1"), 0, 0, b, 0, 50, 46); op(g(s, "b1"), b);
        xf(g(s, "b2"), 0, 0, c, 0, 112, 36); op(g(s, "b2"), c);
        var r = g(s, "rays"); if (r) r.setAttribute("transform", "rotate(" + (t * 240) + " 112 36)");
      },
      VI: function (s, t) {
        var n = 0, i;
        for (i = 0; i < 5; i++) {
          var u = ease(cl(t, i * .13, i * .13 + .13));
          xf(g(s, "sh" + i), 30 * u, 6 * u, 1, 40 * u, 58, 44 + i * 11); op(g(s, "sh" + i), 1 - u);
          op(g(s, "rg" + i), 1 - u);
          if (u >= 1) n++;
        }
        if (n >= 5) tmp(s, "n", txt(90, 66, "nothing inside", "font-weight:700;fill:var(--bad)"));
      },
      PA: function (s, t) {
        var x = 36 + 98 * t, st = g(s, "stones").children, drops = [.3, .55, .8], cnt = [3, 2, 5], k = 0, i, j;
        xf(g(s, "raft"), x - 134, 0);
        var xc = [65.4, 89.9, 114.4];
        for (i = 0; i < 3; i++) for (j = 0; j < cnt[i]; j++, k++) {
          var el = st[k], fx = +el.getAttribute("cx"), fy = +el.getAttribute("cy");
          if (t < drops[i]) el.setAttribute("transform", "translate(" + (x - fx - 8 + (k * 3 % 14) - 5) + " " + (72 - fy - 4 - (k % 3) * 3) + ")");
          else { var f = ease(cl(t, drops[i], drops[i] + .12)); el.setAttribute("transform", "translate(" + ((drops[i] * 98 + 36) - fx - 8 + (k * 3 % 14) - 5) * (1 - f) + " " + (72 - fy - 4 - (k % 3) * 3) * (1 - f) + ")"); }
        }
        if (t >= .999) for (k = 0; k < st.length; k++) st[k].removeAttribute("transform");
      }
    };
    return function (svg, id) {
      if (!svg || !A[id]) return;
      if (svg._stop) svg._stop();
      var done = false, raf = 0, ms = { T: 4200, CE: 3600, CI: 4200, RU: 3600, NB: 3400, BH: 3200, PR: 4600, JV: 3800, CO: 4200, DO: 5600, RB: 3600, PL: 4000, KA: 3800, SA: 4000, VI: 4600, PA: 5200 }[id] || 3600;
      function fin() {
        if (done) return; done = true; cancelAnimationFrame(raf); reset(svg);
        var els = svg.querySelectorAll("text,circle,ellipse,g,path"); for (var i = 0; i < els.length; i++) { if (els[i].style) { els[i].style.opacity = ""; els[i].style.transform = ""; els[i].style.transformOrigin = ""; } }
        var sp = g(svg, "spk"); if (sp) sp.removeAttribute("transform"); var rr = g(svg, "rays"); if (rr) rr.removeAttribute("transform");
        var sts = g(svg, "stones"); if (sts) for (i = 0; i < sts.children.length; i++) sts.children[i].removeAttribute("transform");
        svg._stop = null; svg.removeAttribute("data-playing");
      }
      svg._stop = fin;
      reset(svg);
      if (RM()) { fin(); return; }
      svg.setAttribute("data-playing", "1");
      var t0 = null;
      function f(ts) { if (done) return; if (t0 === null) t0 = ts; var t = (ts - t0) / ms; if (t >= 1) { fin(); return; } A[id](svg, t); raf = requestAnimationFrame(f); }
      A[id](svg, 0); raf = requestAnimationFrame(f);
    };
  })();
  window.ATLAS = window.ATLAS || {};
  window.ATLAS.ideaPicture = PIC;
  window.ATLAS.animatePicture = animatePicture;
  var PSRC = { T: "SN 5.10; Milindapañha II.1", CE: "Atthasālinī", CI: "Milindapañha II.2", RU: "Visuddhimagga XI", NB: "Sn 5.7 (Upasīva); Therīgāthā 116", BH: "Atthasālinī: bhavaṅga-sota", PR: "Atthasālinī", JV: "Atthasālinī", CO: "SN 12.67", DO: "Visuddhimagga XVII", RB: "Milindapañha II.2", PL: "Visuddhimagga VII, XIII", KA: "AN 3.76; AN 1.314", SA: "Visuddhimagga IV", VI: "SN 22.95", PA: "MN 22" };

  var CANON = {"T": {"refs": ["SN 5.10", "DN 9 (Poṭṭhapāda)", "AN 2.25 (Neyyattha/Nītattha)"], "note": "Technical pair sammuti/paramattha first in Kv; systematized in commentaries (Mp, Vism) and the Manual's ch.1."}, "CE": {"refs": ["Dhs §1", "MN 43", "MN 111"], "note": "Term cetasika is Abhidhamma; the lists of 52 are Dhs plus Aṭṭhasālinī synthesis."}, "CI": {"refs": ["Dhp 1-2", "AN 1.51", "SN 12.61"], "note": "Numbers 89/121 are Abhidhamma/commentarial counting of Dhs."}, "RU": {"refs": ["SN 22.79", "MN 28", "MN 140"], "note": "Count of 28, kalāpa and 4 origins of matter are mostly Abhidhamma/commentarial."}, "NB": {"refs": ["Ud 8.3", "It 2.17 (It 44)", "SN 38.1"], "note": "Ud 1.10 (Bāhiya) is about direct knowing, not Nibbāna as such; use Ud 8.1-4."}, "BH": {"refs": ["AN 1.51", "DN 28 / DN 34", "SN 12.61"], "note": "Mainly post-canonical: Paṭṭhāna seeds, then Milindapañha and Atthasālinī."}, "PR": {"refs": ["MN 18", "SN 35.93", "Paṭṭh (anantara, samanantara)"], "note": "The 17-moment vīthi is commentarial (Vism, Aṭṭhasālinī, Sangaha), not canonical."}, "JV": {"refs": ["SN 35.95", "MN 18", "SN 36.6"], "note": "Term javana as a technical stage: commentarial; absent in suttas."}, "CO": {"refs": ["SN 12.20", "Paṭṭh", "SN 12.67"], "note": "Paṭṭhāna is canonical; mapping to atlas fine."}, "DO": {"refs": ["SN 12.1", "SN 12.2", "DN 15"], "note": "Three-lives reading is commentarial; texts show variants."}, "RB": {"refs": ["MN 38", "DN 15", "SN 12.38-40"], "note": "Cuti/paṭisandhi/bhavaṅga sequence is commentarial."}, "PL": {"refs": ["MN 12", "AN 9.24", "DN 33"], "note": "31 count is a later synthesis; no single sutta lists 31."}, "KA": {"refs": ["AN 6.63", "MN 135", "AN 3.76-77"], "note": "Karma classification (12 types) is commentarial."}, "SA": {"refs": ["DN 2", "MN 118", "AN 2.30"], "note": "40 subjects: Vism, scattered in suttas."}, "VI": {"refs": ["SN 22.59", "DN 22/MN 10", "AN 3.137"], "note": "16 ñāṇas schema is Vism."}, "PA": {"refs": ["Dhs §277", "SN 55.2", "AN 10.13"], "note": "Magga-citta single moment is Abhidhamma."}};
  function canonLine(id) { var c = CANON[id]; return c && c.refs.length ? '<span class="canon">In the Canon: ' + c.refs.join("; ") + (/commentar|post-canonical/i.test(c.note) ? "; mainly a commentarial teaching" : "") + "</span>" : ""; }
  document.addEventListener("click", function (e) { var svg = e.target.closest && e.target.closest("svg.ipic"); if (svg && window.ATLAS.animatePicture) window.ATLAS.animatePicture(svg, svg.getAttribute("data-id")); });
  /* ---------------- the sixteen ideas, described (two pages of eight) ---------------- */
  (function () {
    function one(n) {
      return '<div class="idea" style="--lvc:var(--lv' + n.lv + ')"><figure class="ifig">' + PIC(n.id) + "<figcaption>" + PSRC[n.id] + "</figcaption></figure>" + '<div><h3><a class="ilink" href="#idea-' + n.id + '">' + n.t + '</a> <span>' + n.s + "</span></h3><p>" + (n.long || n.d) + " " + n.p.map(xr).join(" ") + " " + canonLine(n.id) + "</p></div></div>";
    }
    if ($("ideas-list")) $("ideas-list").innerHTML = IDEAS.slice(0, 8).map(one).join("");
    if ($("ideas-list-2")) $("ideas-list-2").innerHTML = IDEAS.slice(8).map(one).join("");
  })();

  /* ---------------- every link: matrix and list ---------------- */
  (function () {
    var list = $("lk-list");
    if (list) list.innerHTML = Object.keys(LTYPE).map(function (k) {
      return '<div class="lkgrp"><div class="lab" style="color:var(' + LTYPE[k][0] + ')">' + LTYPE[k][1] + "</div>" + LINKS.map(function (l, i) {
        if (l.type !== k) return "";
        return '<div class="lk" id="lk-' + i + '"><b><a class="ilink" href="#idea-' + l.from + '">' + short(byId[l.from].t) + '</a> → <a class="ilink" href="#idea-' + l.to + '">' + short(byId[l.to].t) + "</a></b> <i>" + l.label + "</i>. " + l.text + " " + l.p.map(xr).join(" ") +
          ' <a class="xr web" href="#link-' + i + '">map</a></div>';
      }).join("") + "</div>";
    }).join("");
    var mx = $("lk-matrix");
    if (mx) {
      var order = IDEAS.map(function (n) { return n.id; }), cs = 15.5, ox = 112, oy = 112, s = "";
      order.forEach(function (id, i) {
        s += T("a", { href: "#idea-" + id }, T("text", { x: ox - 6, y: f1(oy + i * cs + cs * 0.7), "text-anchor": "end", "class": "tx-xs" }, short(byId[id].t)));
        s += T("a", { href: "#idea-" + id }, T("text", { transform: "translate(" + f1(ox + i * cs + cs * 0.65) + "," + (oy - 6) + ") rotate(-55)", "class": "tx-xs" }, short(byId[id].t)));
        order.forEach(function (jd, j) { s += T("rect", { x: f1(ox + j * cs), y: f1(oy + i * cs), width: cs - 1.5, height: cs - 1.5, rx: 2, style: "fill:var(--faint)" }); });
      });
      LINKS.forEach(function (l, k) {
        var i = order.indexOf(l.from), j = order.indexOf(l.to);
        s += T("a", { href: "#lk-" + k, "class": "mxc" }, T("rect", { x: f1(ox + j * cs), y: f1(oy + i * cs), width: cs - 1.5, height: cs - 1.5, rx: 2, style: "fill:var(" + LTYPE[l.type][0] + ")" }) +
          T("title", {}, short(byId[l.from].t) + " → " + l.label + " → " + short(byId[l.to].t)));
      });
      s += T("text", { x: ox, y: f1(oy + order.length * cs + 16), "class": "tx-xs tx-mu" }, "row: from · column: to · choose a square to read its link");
      mx.innerHTML = s;
    }
    var deg = {}; LINKS.forEach(function (l) { deg[l.from] = (deg[l.from] || 0) + 1; deg[l.to] = (deg[l.to] || 0) + 1; });
    var top = Object.keys(deg).sort(function (a, b) { return deg[b] - deg[a]; });
    var busy = $("lk-busy");
    if (busy) busy.innerHTML = "<b>" + short(byId[top[0]].t) + "</b> takes part in " + deg[top[0]] + " links and <b>" + short(byId[top[1]].t) + "</b> in " + deg[top[1]] + ": they are the busiest ideas on the map.";
  })();

  /* ---------------- the main map as a navigator ---------------- */
  var svg = $("cmap-main"), panel = $("cm-panel");
  if (!svg) return;
  var st = null, trail = [];
  var fromSel = $("cm-from"), toSel = $("cm-to");

  function ideaBtn(id) { return '<button type="button" class="cm-go" data-go="' + id + '"><span class="dotlv" style="background:var(--lv' + byId[id].lv + ')"></span>' + short(byId[id].t) + "</button>"; }
  function linkLine(l, i, other) {
    return "<li>" + ideaBtn(other) + " <i>" + l.label + "</i>. " + l.text + " " + l.p.map(xr).join(" ") + ' <button type="button" class="cm-lk" data-link="' + i + '" aria-label="Show this link on the map">↗</button></li>';
  }
  function renderPanel() {
    if (!panel) return;
    var h = "";
    if (trail.length > 1) {
      h += '<div class="cm-trail"><span class="lab">Your walk</span>' + trail.map(function (id, k) { return (k ? '<em>›</em>' : "") + '<button type="button" class="cm-crumb" data-go="' + id + '">' + short(byId[id].t) + "</button>"; }).join("") +
        ' <button type="button" class="pill" data-act="back">Back</button></div>';
    }
    if (st && st.idea) {
      var n = byId[st.idea];
      var outs = [], ins = [];
      LINKS.forEach(function (l, i) { if (l.from === n.id) outs.push(linkLine(l, i, l.to)); if (l.to === n.id) ins.push(linkLine(l, i, l.from)); });
      var th = TH.filter(function (t) { return n.p.some(function (p) { return t[4].indexOf(p) >= 0; }); }).slice(0, 5);
      h += '<div class="cm-head"><a class="lvb" href="#L' + n.lv + '" style="background:' + lvc(n.lv) + '"><b>' + ROM[n.lv] + "</b>" + LV[n.lv].name + "</a><h3>" + n.t + '</h3><span class="muted ui small">' + n.s + "</span></div>" +
        '<p class="small">' + n.d + " " + n.p.map(xr).join(" ") + "</p>" + (n.long ? '<div class="cm-longw"><div>' + PIC(n.id) + ideaGlyph(n.id) + "</div>" + '<p class="small cm-long">' + n.long + "</p></div>" : "") +
        '<div class="cm-cols"><div><div class="lab">Leads to · ' + outs.length + "</div>" + (outs.length ? '<ul class="cm-list">' + outs.join("") + "</ul>" : '<p class="small muted">Nothing on the map flows out of it.</p>') + "</div>" +
        '<div><div class="lab">Depends on · ' + ins.length + "</div>" + (ins.length ? '<ul class="cm-list">' + ins.join("") + "</ul>" : '<p class="small muted">It is a starting point: nothing on the map leads into it.</p>') + "</div></div>" +
        '<div class="btnrow sm"><button type="button" class="pill" data-act="from">Trace a path from here</button><button type="button" class="pill" data-act="to">Trace a path to here</button><a class="pill" href="#map3d" data-act="3d">See it in 3D</a><button type="button" class="pill" data-act="clear">Clear</button>' +
        (th.length ? '<span class="thrs">' + th.map(function (t) { return '<span class="thr"><i style="background:' + t[3] + '"></i>' + t[5] + "</span>"; }).join("") + "</span>" : "") + "</div>";
    } else if (st && st.link != null) {
      var l = LINKS[st.link];
      h += '<div class="cm-head"><span class="lab" style="color:var(' + LTYPE[l.type][0] + ')">' + LTYPE[l.type][1] + "</span><h3>" + short(byId[l.from].t) + " → " + short(byId[l.to].t) + "</h3></div>" +
        '<p class="small"><i>' + l.label + ".</i> " + l.text + " " + l.p.map(xr).join(" ") + "</p>" +
        '<div class="btnrow sm">' + ideaBtn(l.from) + ideaBtn(l.to) + '<button type="button" class="pill" data-act="clear">Clear</button></div>';
    } else if (st && st.path) {
      var a = st.ends[0], b = st.ends[1];
      if (!st.path.length) h += '<p class="small">No chain of links joins these two ideas on the map.</p>';
      else {
        var against = st.path.some(function (s) { return !s.fwd; });
        h += '<div class="cm-head"><span class="lab">A path in ' + st.path.length + (st.path.length > 1 ? " steps" : " step") + "</span><h3>" + short(byId[a].t) + " to " + short(byId[b].t) + "</h3></div>" +
          '<ol class="cm-steps">' + st.path.map(function (s) {
            var l = LINKS[s.i];
            return "<li>" + ideaBtn(s.fwd ? l.from : l.to) + " " + (s.fwd ? "<i>" + l.label + "</i> →" : "← <i>" + l.label + "</i> (read against the arrow)") + " " + ideaBtn(s.fwd ? l.to : l.from) +
              '<div class="small">' + l.text + " " + l.p.map(xr).join(" ") + "</div></li>";
          }).join("") + "</ol>" +
          (against ? '<p class="cap">No chain runs all the way along the arrows, so some steps are read backwards: “depends on” instead of “leads to”.</p>' : "") +
          '<p class="cap">Try saying the chain aloud as one sentence, then check each step on its plate. This is the Reflect depth of the atlas.</p>';
      }
      h += '<div class="btnrow sm"><button type="button" class="pill" data-act="clear">Clear</button></div>';
    } else if (st && st.loop) {
      var ls = loopLinks(st.loop);
      h += '<div class="cm-head"><span class="lab">A loop</span><h3>' + { life: "The loop of a life", mm: "Mind and matter hold each other up", way: "The way out" }[st.loop] + "</h3></div>" +
        '<ol class="cm-steps">' + ls.map(function (i) { var l = LINKS[i]; return "<li>" + ideaBtn(l.from) + " <i>" + l.label + "</i> → " + ideaBtn(l.to) + '<div class="small">' + l.text + "</div></li>"; }).join("") + "</ol>" +
        '<div class="btnrow sm"><button type="button" class="pill" data-act="clear">Clear</button></div>';
    } else {
      h += '<p class="small">Choose an idea on the map, or below, to see what it leads to and what it depends on. Every name in this panel opens that idea, so you can walk the map one link at a time. Choose an arrow to read its link.</p>' +
        '<div class="cm-start">' + [1, 2, 3, 4, 5, 6].map(function (lv) {
          return '<div><span class="lab">' + ROM[lv] + " · " + LV[lv].name + "</span>" + IDEAS.filter(function (n) { return n.lv === lv; }).map(function (n) { return ideaBtn(n.id); }).join("") + "</div>";
        }).join("") + "</div>";
    }
    panel.innerHTML = h;
  }

  function announce() {
    var d = { idea: null, loop: null, path: null };
    if (st && st.idea) d.idea = st.idea;
    else if (st && st.loop) d.loop = st.loop;
    else if (st && st.path) d.path = st.path.map(function (s) { return s.i; });
    else if (st && st.link != null) d.path = [st.link];
    try { document.dispatchEvent(new CustomEvent("atlas:select", { detail: d })); } catch (e) {}
  }
  function render() {
    var f = document.activeElement, fid = f && f.getAttribute && (f.getAttribute("data-id") || f.getAttribute("data-li"));
    var wasNode = f && f.classList && f.classList.contains("cmn");
    draw(svg, 0, st, true);
    renderPanel();
    if (fid != null && svg.contains(f) === false) {
      var again = svg.querySelector(wasNode ? '[data-id="' + fid + '"]' : '[data-li="' + fid + '"]');
      if (again && again.focus) try { again.focus({ preventScroll: true }); } catch (e) { again.focus(); }
    }
    announce();
  }
  function setState(next, keepTrail) {
    st = next;
    if (st && st.idea && !keepTrail) { if (trail[trail.length - 1] !== st.idea) trail.push(st.idea); if (trail.length > 8) trail.shift(); }
    if (!st) trail = [];
    render();
  }
  function selectIdea(id) { if (byId[id]) setState(st && st.idea === id ? null : { idea: id }); }
  function showPath(a, b) {
    if (!byId[a] || !byId[b] || a === b) return;
    if (fromSel) fromSel.value = a;
    if (toSel) toSel.value = b;
    setState({ path: trace(a, b) || [], ends: [a, b] });
  }
  function bringIntoView() { var m = $("map"); if (m && m.scrollIntoView) m.scrollIntoView({ block: "start" }); }

  /* path finder controls */
  if (fromSel && toSel) {
    var opts = [1, 2, 3, 4, 5, 6].map(function (lv) {
      return '<optgroup label="' + ROM[lv] + " · " + LV[lv].name + '">' + IDEAS.filter(function (n) { return n.lv === lv; }).map(function (n) { return '<option value="' + n.id + '">' + short(n.t) + "</option>"; }).join("") + "</optgroup>";
    }).join("");
    fromSel.innerHTML = opts; toSel.innerHTML = opts;
    fromSel.value = "JV"; toSel.value = "RU";
    $("cm-trace").addEventListener("click", function () { showPath(fromSel.value, toSel.value); });
    $("cm-swap").addEventListener("click", function () { var a = fromSel.value; fromSel.value = toSel.value; toSel.value = a; if (st && st.path) showPath(fromSel.value, toSel.value); });
    $("cm-random").addEventListener("click", function () {
      var a, b; do { a = IDEAS[Math.floor(Math.random() * IDEAS.length)].id; b = IDEAS[Math.floor(Math.random() * IDEAS.length)].id; } while (a === b);
      showPath(a, b);
    });
  }

  /* clicks on the map */
  svg.addEventListener("click", function (e) {
    var n = e.target.closest(".cmn");
    if (n) { selectIdea(n.getAttribute("data-id")); return; }
    var l = e.target.closest(".cme");
    if (l) { var i = +l.getAttribute("data-li"); setState(st && st.link === i ? null : { link: i }); return; }
    if (e.target === svg || e.target.tagName === "rect") setState(null);
  });
  svg.addEventListener("keydown", function (e) {
    var n = e.target.closest && e.target.closest(".cmn");
    if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); selectIdea(n.getAttribute("data-id")); }
    if (e.key === "Escape") setState(null);
  });
  if (panel) panel.addEventListener("click", function (e) {
    var b = e.target.closest("button, a[data-act]"); if (!b) return;
    var go = b.getAttribute("data-go"), lk = b.getAttribute("data-link"), act = b.getAttribute("data-act");
    if (go) { setState({ idea: go }, b.classList.contains("cm-crumb")); return; }
    if (lk != null) { setState({ link: +lk }); return; }
    if (act === "clear") setState(null);
    else if (act === "back") { trail.pop(); var prev = trail[trail.length - 1]; setState(prev ? { idea: prev } : null, true); }
    else if (act === "from" && st && st.idea) { fromSel.value = st.idea; if (toSel.value === st.idea) toSel.value = st.idea === "NB" ? "T" : "NB"; showPath(fromSel.value, toSel.value); }
    else if (act === "to" && st && st.idea) { toSel.value = st.idea; if (fromSel.value === st.idea) fromSel.value = st.idea === "T" ? "NB" : "T"; showPath(fromSel.value, toSel.value); }
    else if (act === "3d") announce();
  });
  each("[data-loop]", function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-loop"); setState(st && st.loop === v ? null : { loop: v }); });
  });

  /* deep links from anywhere: #idea-XX, #link-N, #path-XX-YY, #loop-name */
  function route(hash, jump) {
    var m;
    if ((m = /^#idea-([A-Z]+)$/.exec(hash)) && byId[m[1]]) { st = null; setState({ idea: m[1] }); }
    else if ((m = /^#link-(\d+)$/.exec(hash)) && LINKS[+m[1]]) setState({ link: +m[1] });
    else if ((m = /^#path-([A-Z]+)-([A-Z]+)$/.exec(hash))) showPath(m[1], m[2]);
    else if ((m = /^#loop-(\w+)$/.exec(hash)) && LOOPS[m[1]]) setState({ loop: m[1] });
    else return false;
    if (jump) bringIntoView();
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#idea-"], a[href^="#link-"], a[href^="#path-"], a[href^="#loop-"]');
    if (!a) return;
    if (route(a.getAttribute("href"), true)) e.preventDefault();
  });
  window.addEventListener("hashchange", function () { route(location.hash, true); });

  render();
  if (location.hash) route(location.hash, true);
})();
