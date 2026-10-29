(function () {
  "use strict";
  function A(o) { var s = ""; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += " " + k + '="' + o[k] + '"'; return s; }
  function T(tag, o, inner) { return inner === undefined ? "<" + tag + A(o) + "/>" : "<" + tag + A(o) + ">" + inner + "</" + tag + ">"; }
  function $(id) { return document.getElementById(id); }
  function f1(n) { return Math.round(n * 10) / 10; }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  var ROM = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
  function xr(n) { return '<a class="xr" href="#p' + n + '">→ ' + n + "</a>"; }
  function lvc(n) { return "var(--lv" + n + ")"; }

  /* ---------------- data (see data.js) ---------------- */
  var D = window.ATLAS, PL = D.plates, FROM = D.builds, LV = D.levels, TH = D.threads;
  var COMP = D.companions || {};
  function compsAfter(p) { return Object.keys(COMP).filter(function (k) { return COMP[k].after === p; }); }
  var KIND = D.storyKinds, ST = D.stories, LIFE_PAST = D.lifePast, LIFE_LAST = D.lifeLast, GL = D.glossary;
  var TO = {};
  Object.keys(FROM).forEach(function (k) { FROM[k].forEach(function (f) { (TO[f] = TO[f] || []).push(+k); }); });

  /* ---------------- level pages ---------------- */
  each("section.level", function (sec) {
    var n = +sec.getAttribute("data-level"), L = LV[n];
    sec.style.setProperty("--lvc", lvc(n));
    var cards = L.plates.map(function (p) {
      return '<a class="pc" href="#p' + p + '"><b>' + p + "</b><div><h3>" + PL[p].t + "</h3><p>" + PL[p].k + "</p></div></a>" +
        compsAfter(p).map(function (c) { return '<a class="pc" href="#p' + c + '"><b>' + c + "</b><div><h3>" + COMP[c].t + "</h3><p>" + COMP[c].k + "</p></div></a>"; }).join("");
    }).join("");
    var many = L.plates.length + L.plates.reduce(function (k, p) { return k + compsAfter(p).length; }, 0) >= 5;
    if (many) cards += '<div class="pc"><b>◈</b><div><h3><a href="#D' + n + '">In 3D</a> · <a href="#S' + n + '">In the stories</a></h3><p>Models to turn, then episodes from the Buddha\'s life, the Jātakas and the disciples.</p></div></div>';
    else {
      cards += '<a class="pc" href="#D' + n + '"><b>◈</b><div><h3>In 3D</h3><p>Models of this level\'s diagrams to turn and explore.</p></div></a>';
      cards += '<a class="pc" href="#S' + n + '"><b>✦</b><div><h3>In the stories</h3><p>Episodes from the Buddha\'s life, the Jātakas and the disciples, read with these plates.</p></div></a>';
    }
    if (n === 7) cards += '<a class="pc" href="#threads"><b>↯</b><div><h3>Threads and glossary</h3><p>Every key idea traced across the plates, what to read in the Manual, and 150 terms.</p></div></a>';
    var HN = (D.hints || {})[n] || [];
    function col(title, pali, hint, list, hints) {
      return '<div class="qcol"><h3>' + title + " <i>" + pali + '</i></h3><div class="hint">' + hint + "</div><ol>" + list.map(function (q, i) {
        return "<li>" + q + (hints && hints[i] ? '<details class="web qhint"><summary>hint</summary>' + hints[i] + "</details>" : "") + "</li>";
      }).join("") + "</ol></div>";
    }
    var PQ = (D.prereq || {})[n];
    var pre = PQ ? '<details class="web prechk"><summary>Before you start: three quick checks on what this level assumes</summary><ol>' +
      PQ.map(function (q) { return "<li>" + q[0] + '<details><summary>answer</summary>' + q[1] + "</details></li>"; }).join("") + "</ol></details>" : "";
    var range = L.plates.length > 1 ? "plates " + L.plates[0] + "–" + L.plates[L.plates.length - 1] : "plate " + L.plates[0];
    sec.innerHTML =
      '<div class="ph"><span><b>Level ' + ROM[n] + "</b> · " + L.name + "</span><span>Abhidhamma Atlas</span></div>" +
      '<div class="lvhead"><div class="lvnum">' + ROM[n] + '</div><div><div class="lab">Level ' + ROM[n] + " of VII · " + range + "</div><h2>" + L.name + '</h2><p class="lvq">' + L.q + "</p></div></div>" +
      '<svg class="ladder" data-lv="' + n + '" viewBox="0 0 680 50" aria-label="Position in the seven levels"></svg>' +
      /* r2: arrive box and plate cards side by side; the concept map below at full width, cropped to this level's rows */
      '<div class="lvcols lvcols2">' +
      '<div class="box"><div class="lab">You arrive with</div><p class="small">' + L.arrive + '</p><div class="lab" style="margin-top:4px">You leave able to</div><ul class="tight small">' + L.leave.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
      '<div class="pcards' + (L.plates.length > 1 ? " two" : "") + ((cards.match(/class="pc"/g) || []).length >= 7 ? " brief" : "") + '">' + cards + "</div></div>" +
      '<div class="fig lvmap' + (n === 7 ? " whole" : "") + '"><svg class="cmap" data-hl="' + n + '" viewBox="0 0 680 610" role="img" aria-label="The part of the concept map around this level"></svg>' +
      '<p class="cap">' + (n === 7 ? "Synthesis uses the whole map (page 5)." : "The concept map around this level. Filled: this level. Outlined: earlier levels. Faded: what comes later. Bold arrows touch this level; the whole map is on page 5.") + '<span class="web"> Choose a box to open it on the main map.</span></p></div>' +
      pre + '<div class="lab">Check yourself at three depths</div>' +
      '<div class="qgrid">' + col("Learn", "suta", "recall the lists and terms", L.learn) + col("Reflect", "cintā", "connect and explain", L.reflect, HN) + col("Observe", "bhāvanā", "find it in experience", L.observe) + "</div>" +
      '<div class="box"><h3>Common confusions</h3><ul class="conf">' + L.conf.map(function (c) { return "<li><span>" + c + "</span></li>"; }).join("") + "</ul></div>" +
      '<div class="pf"><span>Level ' + ROM[n] + " · " + L.name + " · " + range + '</span><span class="pg"></span></div>';
  });

  each("svg.ladder", function (svg) {
    var cur = +svg.getAttribute("data-lv"), s = "";
    for (var i = 1; i <= 7; i++) {
      var x = (i - 1) * 97 + 1, h = 8 + i * 3.4, y = 30 - h;
      var st = i === cur ? "fill:" + lvc(i) : (i < cur ? "fill:color-mix(in srgb, " + lvc(i) + " 30%, var(--sheet))" : "fill:none;stroke:var(--line)");
      var g = T("rect", { x: x, y: y, width: 93, height: h, rx: 2, style: st }) +
        T("text", { x: x, y: 44, "class": "tx-xs" + (i === cur ? " tx-b" : " tx-mu") }, ROM[i] + " · " + LV[i].name);
      s += T("a", { href: "#L" + i }, g);
    }
    svg.innerHTML = s;
  });

  /* ---------------- nav strip on plates ---------------- */
  each("section.sheet", function (sec) {
    var m = /^p(\d+)$/.exec(sec.id), c = /^p(\d+b)$/.exec(sec.id);
    if (c && COMP[c[1]]) {
      var C = COMP[c[1]], cn = document.createElement("div");
      cn.className = "nav";
      cn.innerHTML = '<a class="lvb" href="#L' + C.lv + '" style="background:' + lvc(C.lv) + ';border:0"><b>' + ROM[C.lv] + "</b>" + LV[C.lv].name + "</a><span>Continues " + C.from.map(function (f) { return '<a href="#p' + f + '">' + f + "</a>"; }).join(" · ") +
        "</span><span>Leads to " + C.to.map(function (f) { return '<a href="#p' + f + '">' + f + "</a>"; }).join(" · ") + "</span>";
      sec.querySelector(".ph").insertAdjacentElement("afterend", cn);
      return;
    }
    if (!m) return;
    var n = +m[1], P = PL[n], lv = P.lv;
    var from = FROM[n] ? (n === 14 ? 'Builds on <a href="#p2">2</a>–<a href="#p13">13</a>' : "Builds on " + FROM[n].map(function (f) { return '<a href="#p' + f + '">' + f + "</a>"; }).join(" · ")) : "Start of the path";
    var to = TO[n] ? "Leads to " + TO[n].map(function (f) { return '<a href="#p' + f + '">' + f + "</a>"; }).join(" · ") : '<a href="#threads">Threads and glossary</a>';
    var th = TH.filter(function (t) { return t[4].indexOf(n) >= 0; }).map(function (t) { return '<span class="thr"><i style="background:' + t[3] + '"></i>' + t[5] + "</span>"; }).join("");
    var nav = document.createElement("div");
    nav.className = "nav";
    nav.innerHTML = '<a class="lvb" href="#L' + lv + '" style="background:' + lvc(lv) + ';border:0"><b>' + ROM[lv] + "</b>" + LV[lv].name + "</a><span>" + from + "</span><span>" + to + '</span><span><a href="#D' + lv + '">3D view</a></span><span class="thrs">' + th + "</span>";
    sec.querySelector(".ph").insertAdjacentElement("afterend", nav);
  });

  /* ---------------- taxonomy table, routes, dag ---------------- */
  (function () {
    var t = $("tax"); if (!t) return;
    var h = "<thead><tr><th></th>";
    for (var i = 1; i <= 7; i++) h += '<th><a href="#L' + i + '"><div class="stp" style="height:' + (6 + i * 5) + "px;background:" + lvc(i) + '"></div><b>' + ROM[i] + "</b><span>" + LV[i].name + "</span></a></th>";
    h += "</tr></thead><tbody>";
    function row(cls, head, fn) { var r = '<tr class="' + cls + '"><th>' + head + "</th>"; for (var i = 1; i <= 7; i++) r += "<td>" + fn(i) + "</td>"; return r + "</tr>"; }
    h += row("q", "Question", function (i) { return LV[i].qs; });
    h += row("pl", "Plates", function (i) { return LV[i].plates.map(function (p) { return '<a href="#p' + p + '" style="background:' + lvc(i) + '">' + p + "</a>"; }).join(""); });
    h += row("d1", "Learn<br><i>suta</i>", function (i) { return LV[i].tax[0]; });
    h += row("d2", "Reflect<br><i>cintā</i>", function (i) { return LV[i].tax[1]; });
    h += row("d3", "Observe<br><i>bhāvanā</i>", function (i) { return LV[i].tax[2]; });
    t.innerHTML = h + "</tbody>";

    var routes = [
      ["Full course", "every level page and plate, in order", null],
      ["Quick tour", "the core in six plates", [2, 3, 7, 9, 13, 14]],
      ["Practitioner's route", "from the elements to the path", [2, 4, 7, 9, 12, 13, 14]]
    ];
    $("routes").innerHTML = routes.map(function (r) {
      var seq = r[2] ? r[2].map(function (p) { return '<a href="#p' + p + '">' + p + " " + PL[p].s + "</a>"; }).join("<em>→</em>") : '<a href="#L1">Level I</a><em>→</em><span>1</span><em>→</em><span>2</span><em>→</em><a href="#L2">Level II</a><em>→ … →</em><a href="#threads">Threads</a>';
      return '<div class="rt"><div><b>' + r[0] + '</b><div class="cap">' + r[1] + '</div></div><div class="seq">' + seq + "</div></div>";
    }).join("");

    var cx = function (lv) { return 48 + (lv - 1) * 98; };
    var pos = {};
    for (var l = 1; l <= 7; l++) {
      var ps = LV[l].plates, nn = ps.length;
      ps.forEach(function (p, i) { pos[p] = { x: cx(l), y: 128 + (i - (nn - 1) / 2) * 42, lv: l }; });
    }
    var s = "<defs>" + T("marker", { id: "dag-a", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, T("path", { d: "M0 0 L10 5 L0 10 z", style: "fill:var(--muted)" })) + "</defs>";
    for (l = 1; l <= 7; l++) {
      s += T("rect", { x: cx(l) - 47, y: 4, width: 94, height: 228, rx: 6, style: "fill:" + (l % 2 ? "var(--faint)" : "none") });
      s += T("text", { x: cx(l), y: 20, "text-anchor": "middle", "class": "tx-s tx-b" }, ROM[l] + " · " + LV[l].name);
    }
    Object.keys(FROM).forEach(function (k) {
      FROM[k].forEach(function (f) {
        var a = pos[f], b = pos[+k], d;
        if (a.lv === b.lv && Math.abs(b.y - a.y) < 50) {
          d = "M" + a.x + " " + (a.y + 14) + " L" + b.x + " " + (b.y - 15);
        } else if (a.lv === b.lv) {
          var off = 54 + Math.abs(b.y - a.y) / 14;
          d = "M" + (a.x + 42) + " " + a.y + " C" + (a.x + off) + " " + a.y + ", " + (b.x + off) + " " + b.y + ", " + (b.x + 43) + " " + b.y;
        } else {
          var mx = (a.x + 42 + b.x - 42) / 2;
          d = "M" + (a.x + 42) + " " + a.y + " C" + mx + " " + a.y + ", " + mx + " " + b.y + ", " + (b.x - 43) + " " + b.y;
        }
        s += T("path", { d: d, style: "fill:none;stroke:var(--muted);stroke-width:1.1;opacity:.8", "marker-end": "url(#dag-a)" });
      });
    });
    Object.keys(pos).forEach(function (p) {
      var o = pos[p];
      s += T("a", { href: "#p" + p },
        T("rect", { x: o.x - 42, y: o.y - 14, width: 84, height: 28, rx: 5, style: "fill:var(--sheet);stroke:" + lvc(o.lv) + ";stroke-width:1.4" }) +
        T("rect", { x: o.x - 42, y: o.y - 14, width: 22, height: 28, rx: 5, style: "fill:" + lvc(o.lv) }) +
        T("text", { x: o.x - 31, y: o.y + 4, "text-anchor": "middle", "class": "tx-s tx-b", style: "fill:var(--on-lv)" }, p) +
        T("text", { x: o.x - 15, y: o.y + 4, "class": "tx-s" }, PL[p].s));
    });
    $("dag").innerHTML = s;
  })();

  /* ---------------- plate 14: one moment, every lens (r2: each lens shows its plate) ----------------
     Ten cards, each with a thumbnail of its plate's own drawing with the mango moment marked,
     so Plate 14 is a review of pictures already seen. Texts come from D.mango.lens;
     the moment strip and the mango come from ATLAS.glyph (plates.js). */
  (function () {
    var svg = $("lens"); if (!svg) return;
    var M = D.mango, G = D.glyph, FEEL = { J: "var(--f-joy)", E: "var(--f-eq)", S: "var(--f-ple)", P: "var(--f-pain)", D: "var(--f-dis)", V: "var(--f-joy)" };
    var INK = "fill:none;stroke:var(--ink);stroke-width:1.1";
    function tiny(x, y, t, cls, anchor) { return T("text", { x: f1(x), y: f1(y), "text-anchor": anchor || "start", "class": "tx-mu" + (cls ? " " + cls : ""), style: "font-size:6.6px" }, t); }
    function arrow(x1, y1, x2, y2, col) {
      var a = Math.atan2(y2 - y1, x2 - x1), h = 3.2;
      return T("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), style: "stroke:" + col + ";stroke-width:1" }) +
        T("path", { d: "M" + f1(x2) + " " + f1(y2) + " L" + f1(x2 - h * Math.cos(a - 0.45)) + " " + f1(y2 - h * Math.sin(a - 0.45)) + " L" + f1(x2 - h * Math.cos(a + 0.45)) + " " + f1(y2 - h * Math.sin(a + 0.45)) + " Z", style: "fill:" + col });
    }
    /* each thumbnail draws in a 112 × 80 box at (x, y) */
    var TH = {
      2: function (x, y) {
        var s = T("circle", { cx: x + 16, cy: y + 24, r: 6, style: "fill:var(--faint);stroke:var(--muted)" }) + T("path", { d: "M" + (x + 5) + " " + (y + 52) + " q0 -18 11 -18 q11 0 11 18 Z", style: "fill:var(--faint);stroke:var(--muted)" });
        s += tiny(x + 16, y + 64, "“I see it”", "", "middle") + arrow(x + 34, y + 38, x + 50, y + 38, "var(--muted)");
        s += T("rect", { x: x + 56, y: y + 8, width: 7, height: 7, rx: 1, style: "fill:var(--rupa-mark)" }) + tiny(x + 66, y + 14, "eye-base") + T("rect", { x: x + 56, y: y + 19, width: 7, height: 7, rx: 1, style: "fill:var(--rupa-mark);opacity:.6" }) + tiny(x + 66, y + 25, "colour");
        for (var i = 0; i < 7; i++) s += T("circle", { cx: x + 59.5 + (i % 4) * 7, cy: y + 35 + Math.floor(i / 4) * 7, r: 2.4, style: "fill:var(--nama-2)" });
        s += tiny(x + 88, y + 39, "factors") + T("circle", { cx: x + 62, cy: y + 58, r: 6, style: "fill:var(--nama)" }) + tiny(x + 72, y + 61, "a citta");
        return s + tiny(x + 56, y + 76, "and no owner");
      },
      3: function (x, y) {
        var rows = [[8, 2, 2], [7, 8, 3], [8, 8, 8], [5, 5, 5], [4, 4, 4], [4, 4]], n = 1, s = "", feel = {};
        D.cittas.forEach(function (c) { feel[c[0]] = c[2]; });
        rows.forEach(function (r, ri) {
          var xx = x + 2, yy = y + 4 + ri * 12.4 + (ri >= 3 ? 2 : 0);
          r.forEach(function (len) {
            for (var i = 0; i < len; i++) {
              var on = M.cittas.indexOf(n) >= 0;
              s += T("rect", { x: f1(xx), y: f1(yy), width: 3.4, height: 7, rx: .8, style: "fill:" + (on ? FEEL[feel[n]] : "var(--line)") + (on ? ";stroke:var(--ink);stroke-width:.9" : "") });
              xx += 4.2; n++;
            }
            xx += 3;
          });
        });
        return s + tiny(x + 2, y + 81, "ringed: #28 #20 #25 #26 #29 #3");
      },
      4: function (x, y) {
        var cx = x + 56, cy = y + 38, s = "";
        function ring(n, r, a0, a1, fn) { for (var i = 0; i < n; i++) { var a = (a0 + (a1 - a0) * (n === 1 ? 0 : i / (n - 1))) * Math.PI / 180; s += fn(cx + r * Math.cos(a), cy + r * Math.sin(a), i); } }
        ring(25, 34, -75, 75, function (px, py) { return T("circle", { cx: f1(px), cy: f1(py), r: 1.8, style: "fill:var(--line)" }); });
        ring(14, 34, 105, 255, function (px, py, i) { var on = i < 5, may = i === 6; return T("circle", { cx: f1(px), cy: f1(py), r: on ? 2.6 : 1.8, style: on ? "fill:var(--bad)" : (may ? "fill:none;stroke:var(--bad);stroke-dasharray:1.5 1" : "fill:var(--line)") }); });
        ring(6, 23, -60, 240, function (px, py) { return T("circle", { cx: f1(px), cy: f1(py), r: 2.4, style: "fill:var(--nama-2)" }); });
        ring(7, 13, -90, 218, function (px, py) { return T("circle", { cx: f1(px), cy: f1(py), r: 2.4, style: "fill:var(--nama)" }); });
        s += T("circle", { cx: cx, cy: cy, r: 6, style: "fill:var(--nama)" });
        return s + tiny(x + 2, y + 79, "7+6+4+greed = 18; conceit may join");
      },
      5: function (x, y) {
        var s = "";
        function row(yy, n, add, lab, sub) {
          for (var i = 0; i < n; i++) s += T("rect", { x: x + 2 + i * 6, y: yy, width: 5, height: 5, rx: .8, style: i < 8 ? "fill:var(--rupa-soft);stroke:var(--rupa-mark);stroke-width:.7" : "fill:var(--rupa-mark)" });
          s += tiny(x + 2 + n * 6 + 3, yy + 5, lab, "tx-b") + tiny(x + 2, yy + 13, sub);
        }
        row(y + 4, 10, 2, "eye-decad", "kamma-born: the eye-base");
        row(y + 28, 8, 0, "octad", "temperature-born: its colour");
        row(y + 52, 8, 0, "octads ×7", "mind-born, one per javana");
        return s;
      },
      7: function (x, y) {
        return G.strip({ x: x + 2, y: y + 10, cw: 5.6, ch: 14, gap: .8, obj: true, hl: [5, 9, 10, 11, 12, 13, 14, 15] }) +
          tiny(x + 2 + 4 * 6.4 + 2.8, y + 40, "5 sees", "", "middle") + tiny(x + 2 + 11 * 6.4 + 2.8, y + 40, "9–15 wanting", "", "middle") + tiny(x + 2, y + 6, "the mango's matter: 17 moments") +
          tiny(x + 2, y + 56, "very great object, at the eye-door") + tiny(x + 2, y + 66, "then registration, then sleep");
      },
      8: function (x, y) {
        var s = "", C = "var(--nama)", R = "var(--rupa-mark)";
        function sq(px, py) { return T("rect", { x: px - 4, y: py - 4, width: 8, height: 8, rx: 1, style: "fill:var(--rupa-mark)" }); }
        function dot(px, py, c) { return T("circle", { cx: px, cy: py, r: 4.2, style: "fill:" + (c || C) }); }
        function n(px, py, t) { return T("circle", { cx: px, cy: py, r: 4.6, style: "fill:var(--sheet);stroke:var(--muted);stroke-width:.6" }) + T("text", { x: px, y: py + 2.3, "text-anchor": "middle", style: "font-size:6px", "class": "tx-b" }, t); }
        s = sq(x + 8, y + 10) + sq(x + 8, y + 46) + dot(x + 8, y + 28) + dot(x + 46, y + 28) + dot(x + 84, y + 28, "var(--nama)") + dot(x + 84, y + 58, "var(--bad)") + dot(x + 106, y + 28);
        s += arrow(x + 12, y + 12, x + 41, y + 25, R) + arrow(x + 12, y + 44, x + 41, y + 31, R) + arrow(x + 13, y + 28, x + 41, y + 28, C) + arrow(x + 51, y + 28, x + 79, y + 28, C) + arrow(x + 84, y + 53, x + 84, y + 33, "var(--bad)") + arrow(x + 89, y + 28, x + 101, y + 28, C);
        s += n(x + 28, y + 14, "10") + n(x + 28, y + 42, "2") + n(x + 26, y + 34, "4") + n(x + 92, y + 45, "1") + n(x + 96, y + 20, "12");
        return s + tiny(x + 2, y + 71, "eye-base, colour → seeing → … javana") + tiny(x + 2, y + 79, "greed a root; javana repeats javana");
      },
      9: function (x, y) {
        var cx = x + 38, cy = y + 40, s = "", K = "DKRRRRRDDKRR";
        for (var i = 0; i < 12; i++) {
          var a0 = (-90 + i * 30 + 1.5) * Math.PI / 180, a1 = (-90 + (i + 1) * 30 - 1.5) * Math.PI / 180, r0 = 22, r1 = 35;
          var on = i >= 5 && i <= 7, col = { D: "var(--bad)", K: "var(--kamma)", R: "var(--nama-2)" }[K[i]];
          s += T("path", { d: "M" + f1(cx + r1 * Math.cos(a0)) + " " + f1(cy + r1 * Math.sin(a0)) + " A" + r1 + " " + r1 + " 0 0 1 " + f1(cx + r1 * Math.cos(a1)) + " " + f1(cy + r1 * Math.sin(a1)) + " L" + f1(cx + r0 * Math.cos(a1)) + " " + f1(cy + r0 * Math.sin(a1)) + " A" + r0 + " " + r0 + " 0 0 0 " + f1(cx + r0 * Math.cos(a0)) + " " + f1(cy + r0 * Math.sin(a0)) + " Z",
            style: "fill:" + col + (on ? ";stroke:var(--ink);stroke-width:.9" : ";opacity:.28") });
        }
        var ad = (-90 + 7 * 30) * Math.PI / 180;
        s += T("path", { d: "M" + f1(cx + 37 * Math.cos(ad)) + " " + f1(cy + 37 * Math.sin(ad) - 4) + " l4 4 l-4 4 l-4 -4 Z", style: "fill:var(--sheet);stroke:var(--ink);stroke-width:.9" });
        return s + tiny(x + 80, y + 30, "6 contact") + tiny(x + 80, y + 40, "7 feeling") + tiny(x + 80, y + 50, "8 craving") + tiny(x + 80, y + 62, "◇ connection 2");
      },
      10: function (x, y) {
        var s = "";
        for (var i = 0; i < 7; i++) s += T("rect", { x: x + 4 + i * 15, y: y + 6, width: 12, height: 12, rx: 2, style: "fill:var(--nama)" }) + T("text", { x: x + 10 + i * 15, y: y + 14.5, "text-anchor": "middle", "class": "tx-onac", style: "font-size:6px" }, "J" + (i + 1));
        s += T("path", { d: "M" + (x + 10) + " " + (y + 19) + " q0 14 -4 22", style: "fill:none;stroke:var(--kamma);stroke-width:1" }) + tiny(x + 2, y + 50, "J1: this life");
        s += T("path", { d: "M" + (x + 100) + " " + (y + 19) + " q0 14 4 22", style: "fill:none;stroke:var(--kamma);stroke-width:1" }) + tiny(x + 110, y + 50, "J7: next", "", "end");
        for (i = 1; i < 6; i++) s += T("path", { d: "M" + (x + 10 + i * 15) + " " + (y + 19) + " Q" + (x + 10 + i * 15) + " " + (y + 34) + " " + (x + 55) + " " + (y + 60), style: "fill:none;stroke:var(--kamma);stroke-width:.8;opacity:.75" });
        return s + tiny(x + 55, y + 70, "J2–6: any later life", "", "middle") + tiny(x + 55, y + 79, "unless it lapses", "", "middle");
      },
      11: function (x, y) {
        var s = "", W = [84, 80, 76, 72, 70, 66, 62, 58, 54, 50, 50, 44, 40, 36, 32, 28, 24, 20, 14, 8, 60, 54, 48, 42, 36, 30, 0, 0, 0, 0, 0];
        W.forEach(function (w, i) {
          var yy = y + 3 + i * 2.25 + (i >= 20 ? 2 : 0) + (i >= 26 ? 2 : 0), human = i === 26, woe = i > 26;
          s += T("rect", { x: x + 4, y: f1(yy), width: human || woe ? 4 : w, height: 1.6, style: "fill:" + (human ? "var(--ink)" : woe ? "var(--bad)" : "var(--line)") });
        });
        return s + tiny(x + 12, y + 67, "◀ human: where he is", "tx-b") + tiny(x + 12, y + 77, "◀ woeful: if it gave rebirth");
      },
      13: function (x, y) {
        var s = "", F = [[1], [1], [1], [2, 3], [2, 3], [4], [4], [4], [4], [4]];
        F.forEach(function (f, i) {
          for (var c = 1; c <= 4; c++) {
            var on = f.indexOf(c) >= 0, me = i === 3, w = me && c === 2;
            s += T("rect", { x: x + 46 + (c - 1) * 15, y: y + 3 + i * 7, width: 11, height: 4.6, rx: 1, style: on ? (w ? "fill:var(--nama-soft);stroke:var(--nama);stroke-width:.7" : "fill:var(--nama)") + (me ? "" : ";opacity:.3") : "fill:var(--faint)" });
          }
        });
        s += T("rect", { x: x + 44, y: y + 3 + 3 * 7 - 1.5, width: 62, height: 7.6, rx: 2, style: INK });
        return s + tiny(x + 42, y + 28, "sensual desire", "tx-b", "end") + ["S", "O", "N", "A"].map(function (l, c) { return tiny(x + 51.5 + c * 15, y + 77, l, "", "middle"); }).join("") + tiny(x + 42, y + 44, "weakened, then", "", "end") + tiny(x + 42, y + 52, "ended", "", "end");
      }
    };
    var ORDER = [[2, "Two truths"], [3, "Citta"], [4, "Cetasika"], [5, "Rūpa"], [7, "Process"], [8, "Conditions"], [9, "Dependent origination"], [10, "Kamma"], [11, "Planes"], [13, "Practice"]];
    function wrap(t, n) {
      var w = t.split(" "), out = [], cur = "";
      w.forEach(function (x) { if ((cur + " " + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += " " + x; });
      if (cur.trim()) out.push(cur.trim());
      return out;
    }
    /* two columns for print and wide screens (svg#lens), one column below 560 px (svg#lens-v) */
    function layout(target, ncol) {
      if (!target) return;
      var s = "", top = ncol === 2 ? 56 : 84, bw = 334, bh = 98, gap = 12, W = ncol === 2 ? 680 : 334;
      s += G.mango(22, 26, 14);
      s += T("text", { x: 46, y: 24, "class": "tx-l tx-d tx-b" }, M.t);
      s += T("text", { x: 46, y: 38, "class": "tx-xs tx-mu" }, ncol === 2 ? "one ordinary moment, ten lenses · each card shows its plate's drawing with this moment marked" : "ten lenses, each with its plate's drawing");
      s += G.strip(ncol === 2 ? { x: 446, y: 10, cw: 11.4, ch: 18, gap: 2, obj: true, hl: [5, 9, 10, 11, 12, 13, 14, 15], num: [1, 5, 9, 15, 17] } : { x: 46, y: 48, cw: 13.6, ch: 16, gap: 2, obj: true, hl: [5, 9, 10, 11, 12, 13, 14, 15], num: [1, 5, 9, 15, 17] });
      ORDER.forEach(function (o, i) {
        var p = o[0], col = i % ncol, row = Math.floor(i / ncol), x = col * (bw + gap), y = top + row * (bh + 5), lv = PL[p].lv;
        var g = T("rect", { x: x, y: y, width: bw, height: bh, rx: 6, style: "fill:var(--sheet);stroke:var(--line)" });
        g += T("rect", { x: x, y: y, width: 4, height: bh, rx: 2, style: "fill:" + lvc(lv) });
        g += T("rect", { x: x + 10, y: y + 6, width: 116, height: 86, rx: 4, style: "fill:var(--faint)" });
        g += TH[p](x + 12, y + 9);
        g += T("text", { x: x + 136, y: y + 19, "class": "tx-m tx-b" }, o[1]);
        var ps = p === 13 ? [12, 13] : [p];
        ps.slice().reverse().forEach(function (pp, j) {
          var px = x + bw - 14 - j * 22;
          g += T("circle", { cx: px, cy: y + 15, r: 9, style: "fill:" + lvc(PL[pp].lv) }) + T("text", { x: px, y: y + 18.5, "text-anchor": "middle", "class": "tx-xs tx-b", style: "fill:var(--on-lv)" }, pp);
        });
        wrap(M.lens[p], 38).forEach(function (ln, j) { g += T("text", { x: x + 136, y: y + 34 + j * 11.6, "class": "tx-s", style: "font-size:9.6px" }, ln); });
        s += T("a", { href: "#p" + p, "aria-label": o[1] + ", Plate " + p }, g);
      });
      target.setAttribute("viewBox", "0 0 " + W + " " + (top + Math.ceil(10 / ncol) * (bh + 5)));
      target.innerHTML = s;
    }
    layout(svg, 2);
    layout($("lens-v"), 1);
    var ws = [["Two truths", "In everyday words, and in dhammas?"], ["Citta", "Which kind, and with what feeling?"], ["Cetasika", "Which factor led: greed, aversion, mindfulness?"], ["Rūpa", "Which base, and which object?"],
      ["Process", "Which door, and how strong an object?"], ["Conditions", "What was the object, the root, the strong support?"], ["Dependent origination", "Did feeling turn into craving?"], ["Kamma", "What was the volition? Is it a habit?"],
      ["Planes", "What kind of world does this mind belong to?"], ["Practice", "What would mindfulness have noticed?"]];
    $("worksheet").innerHTML = ws.map(function (w) { return "<div><b>" + w[0] + "</b> · " + w[1] + "</div>"; }).join("");
  })();

  /* ---------------- threads: metro map and glossary ---------------- */
  (function () {
    var svg = $("metro"); if (!svg) return;
    var X = function (p) { return 200 + (p - 1) * 31.4; };
    var s = "";
    for (var l = 1; l <= 7; l++) {
      var ps = LV[l].plates, x0 = X(ps[0]) - 14, x1 = X(ps[ps.length - 1]) + 14;
      s += T("rect", { x: x0, y: 4, width: x1 - x0, height: 350, rx: 6, style: "fill:" + (l % 2 ? "var(--faint)" : "color-mix(in srgb, var(--faint) 40%, transparent)") });
      s += T("a", { href: "#L" + l }, T("text", { x: (x0 + x1) / 2, y: 20, "text-anchor": "middle", "class": "tx-s tx-b", style: "fill:" + lvc(l) }, ROM[l]));
      ps.forEach(function (p) { s += T("a", { href: "#p" + p }, T("text", { x: X(p), y: 38, "text-anchor": "middle", "class": "tx-s tx-b" }, p)); });
    }
    s += T("text", { x: 0, y: 38, "class": "tx-xs tx-mu tx-b" }, "PLATE →");
    var y0 = 62, dy = 27.5;
    var ys14 = [];
    TH.forEach(function (t, k) {
      var y = y0 + k * dy, ps = t[4];
      s += T("line", { x1: 0, y1: y, x2: 14, y2: y, style: "stroke:" + t[3] + ";stroke-width:5;stroke-linecap:round" });
      s += T("text", { x: 22, y: y + 4, "class": "tx-m" }, '<tspan class="tx-it" style="font-size:12px">' + t[1] + '</tspan><tspan class="tx-mu"> ' + t[2] + "</tspan>");
      s += T("line", { x1: X(ps[0]), y1: y, x2: X(ps[ps.length - 1]), y2: y, style: "stroke:" + t[3] + ";stroke-width:5;stroke-linecap:round" });
      if (ps.indexOf(14) >= 0) ys14.push(y);
    });
    if (ys14.length) s += T("rect", { x: X(14) - 9, y: Math.min.apply(null, ys14) - 9, width: 18, height: Math.max.apply(null, ys14) - Math.min.apply(null, ys14) + 18, rx: 9, style: "fill:var(--sheet);stroke:var(--ink);stroke-width:2" });
    TH.forEach(function (t, k) {
      var y = y0 + k * dy;
      t[4].forEach(function (p) {
        s += T("a", { href: "#p" + p }, T("circle", { cx: f1(X(p)), cy: y, r: p === 14 ? 4.5 : 6, style: "fill:var(--sheet);stroke:" + t[3] + ";stroke-width:3" }));
      });
    });
    s += T("text", { x: X(14), y: 350, "text-anchor": "middle", "class": "tx-xs tx-b" }, "interchange");
    svg.innerHTML = s;

    function term(t) { var p = t.split(" · "); return "<i>" + p[0] + "</i>" + (p[1] ? ' <span class="en">' + p[1] + "</span>" : ""); }
    var half = Math.ceil(GL.length / 2);
    [["gloss", GL.slice(0, half)], ["gloss-2", GL.slice(half)]].forEach(function (g) {
      if ($(g[0])) $(g[0]).innerHTML = g[1].map(function (r) { return "<div>" + term(r[0]) + " " + r[1] + ' <a href="#p' + r[2] + '">' + r[2] + "</a></div>"; }).join("");
    });
    if ($("cma")) $("cma").innerHTML = (D.cmaMap || []).map(function (r) { return '<a class="cmr" href="#p' + r[0] + '"><b>' + r[0] + "</b><span>" + r[1] + "</span><em>" + r[2] + "</em></a>"; }).join("");
  })();


  /* ---------------- stories: render ---------------- */
  each("section.stories", function (sec) {
    var n = +sec.getAttribute("data-level"), L = LV[n], list = ST[n];
    sec.style.setProperty("--lvc", lvc(n));
    var cards = list.map(function (st) {
      var kd = KIND[st.k];
      return '<article class="story"><div class="sk"><span class="kind" style="background:' + kd[1] + '">' + kd[0] + '</span><span class="src">' + st.src + "</span></div>" +
        "<h3>" + st.t + "</h3><p>" + st.s + "</p>" +
        '<div class="read"><b>Read with the atlas</b> ' + st.r + " " + st.p.map(xr).join(" ") + "</div>" +
        '<p class="sq"><b>Reflect</b> ' + st.q + "</p></article>";
    }).join("");
    var range = L.plates.length > 1 ? "plates " + L.plates[0] + "–" + L.plates[L.plates.length - 1] : "plate " + L.plates[0];
    sec.innerHTML =
      '<div class="ph"><span><b>Level ' + ROM[n] + "</b> · In the stories</span><span>Abhidhamma Atlas</span></div>" +
      '<div class="nav"><a class="lvb" href="#L' + n + '" style="background:' + lvc(n) + ';border:0"><b>' + ROM[n] + "</b>" + L.name + "</a><span>Retells and reads " + range + '</span><span class="thrs"><span class="thr"><i style="background:' + KIND.life[1] + '"></i>the Buddha\'s life</span><span class="thr"><i style="background:' + KIND.jataka[1] + '"></i>Jātaka</span><span class="thr"><i style="background:' + KIND.disc[1] + '"></i>disciples</span></span></div>' +
      "<h2>" + L.name + " in the stories</h2>" +
      '<p class="lede">The tradition has always taught through lives. Each story is retold briefly from its source. The second part reads it with the plates of this level; those readings are study aids, not claims made by the texts themselves.</p>' +
      '<div class="stories-grid">' + cards + "</div>" +
      '<div class="pf"><span>MN, DN, SN, AN: Majjhima, Dīgha, Saṃyutta, Aṅguttara Nikāya · Ud: Udāna · Ja: Jātaka · Bv: Buddhavaṃsa · Vin: Vinaya</span><span class="pg"></span></div>';
  });

  (function () {
    var box = $("lifemap"); if (!box) return;
    function item(e, i) {
      var link = e[4] ? ' <a class="xr" href="#S' + e[4] + '">story</a>' : "";
      return '<li><div class="when">' + e[2] + '</div><div><b>' + e[0] + "</b>" + link + '<div class="what">' + e[1] + '</div><div class="pls">' +
        e[3].map(function (p) { return '<a href="#p' + p + '" style="background:' + lvc(PL[p].lv) + '">' + p + "</a>"; }).join("") + "</div></div></li>";
    }
    box.innerHTML =
      '<div class="rail past"><div class="lab">Past lives · Jātaka and Buddhavaṃsa</div><ol>' + LIFE_PAST.map(item).join("") + '</ol><div class="cap">↘ From Tusita to the final birth</div></div>' +
      '<div class="rail last"><div class="lab">The last life · Siddhattha Gotama</div><ol>' + LIFE_LAST.map(item).join("") + "</ol></div>";
  })();

  /* ---------------- page numbers and contents ---------------- */
  var sheets = Array.prototype.slice.call(document.querySelectorAll("section.sheet"));
  var pageOf = {};
  sheets.forEach(function (sec, i) {
    pageOf[sec.id] = i + 1;
    var pg = sec.querySelector(".pf .pg");
    if (pg) pg.textContent = i + 1;
  });
  (function () {
    var toc = $("toc"); if (!toc) return;
    function row(href, num, label, cls) { return '<a class="row' + (cls ? " " + cls : "") + '" href="#' + href + '"><b>' + num + "</b><span>" + label + "</span><span>" + pageOf[href] + "</span></a>"; }
    var h = '<div class="grp">' + row("learn", "→", "How to learn with this atlas", "h") + row("study", "→", "How to study slowly") + row("plan", "→", "A study plan, one plate a week") + row("map", "→", "How the main ideas connect") + row("map3d", "→", "The map in 3D") + row("links", "→", "Every link explained") + row("life", "→", "The Buddha's life as a map") + "</div>";
    for (var l = 1; l <= 7; l++) {
      h += '<div class="grp">' + row("L" + l, ROM[l], "Level " + ROM[l] + " · " + LV[l].name, "h");
      LV[l].plates.forEach(function (p) { h += row("p" + p, p, PL[p].t); compsAfter(p).forEach(function (c) { h += row("p" + c, c, COMP[c].t); }); });
      h += '<a class="row" href="#D' + l + '"><b>◈</b><span>In 3D, then in the stories</span><span>' + pageOf["D" + l] + "–" + pageOf["S" + l] + "</span></a>";
      if (l === 7) { h += row("threads", "↯", "Threads, and reading with the Manual"); h += row("glossary", "↯", "Glossary of 150 terms"); }
      h += "</div>";
    }
    h += '<div class="grp">' + row("explorer", "✎", "Study tools: one dhamma, many lenses", "h") + row("idcards", "✎", "Sixteen identity cards") + row("deck", "✎", "A review deck in five boxes") + "</div>";
    toc.innerHTML = h;
  })();
  /* ---------------- on-screen definitions: hover or tap a Pāli term ---------------- */
  (function () {
    var M = {};
    function key(t) { return t.toLowerCase().replace(/[“”"'’.,;:()]/g, "").trim(); }
    (D.glossary || []).concat(D.glossaryExtra || []).forEach(function (r) {
      var parts = r[0].split(" · "), d = parts[0] + (parts[1] ? " (" + parts[1] + ")" : "") + ": " + r[1] + " · taught on " + (/^\d/.test(r[2]) ? "Plate " : "") + r[2];
      parts[0].split(/\s*[,\/]\s*/).forEach(function (k) { if (k && !M[key(k)]) M[key(k)] = d; });
    });
    each("section.sheet i, section.sheet em", function (el) {
      if (el.closest("a, svg, .gloss, .lbl3, h1, h2")) return;
      var d = M[key(el.textContent)];
      if (d) { el.classList.add("gl"); el.title = d; }
    });
  })();
})();
