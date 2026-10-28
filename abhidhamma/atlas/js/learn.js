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
  var KIND = D.storyKinds, ST = D.stories, LIFE_PAST = D.lifePast, LIFE_LAST = D.lifeLast, GL = D.glossary;
  var TO = {};
  Object.keys(FROM).forEach(function (k) { FROM[k].forEach(function (f) { (TO[f] = TO[f] || []).push(+k); }); });

  /* ---------------- level pages ---------------- */
  each("section.level", function (sec) {
    var n = +sec.getAttribute("data-level"), L = LV[n];
    sec.style.setProperty("--lvc", lvc(n));
    var cards = L.plates.map(function (p) {
      return '<a class="pc" href="#p' + p + '"><b>' + p + "</b><div><h3>" + PL[p].t + "</h3><p>" + PL[p].k + "</p></div></a>";
    }).join("");
    cards += '<a class="pc" href="#D' + n + '"><b>◈</b><div><h3>In 3D</h3><p>Models of this level\'s diagrams to turn and explore.</p></div></a>';
    cards += '<a class="pc" href="#S' + n + '"><b>✦</b><div><h3>In the stories</h3><p>Episodes from the Buddha\'s life, the Jātakas and the disciples, read with these plates.</p></div></a>';
    if (n === 7) cards += '<a class="pc" href="#threads"><b>↯</b><div><h3>Threads and glossary</h3><p>Every key idea traced across the plates, and the terms that name them.</p></div></a>';
    function col(title, pali, hint, list) {
      return '<div class="qcol"><h3>' + title + " <i>" + pali + '</i></h3><div class="hint">' + hint + "</div><ol>" + list.map(function (q) { return "<li>" + q + "</li>"; }).join("") + "</ol></div>";
    }
    var range = L.plates.length > 1 ? "plates " + L.plates[0] + "–" + L.plates[L.plates.length - 1] : "plate " + L.plates[0];
    sec.innerHTML =
      '<div class="ph"><span><b>Level ' + ROM[n] + "</b> · " + L.name + "</span><span>Abhidhamma Atlas</span></div>" +
      '<div class="lvhead"><div class="lvnum">' + ROM[n] + '</div><div><div class="lab">Level ' + ROM[n] + " of VII · " + range + "</div><h2>" + L.name + '</h2><p class="lvq">' + L.q + "</p></div></div>" +
      '<svg class="ladder" data-lv="' + n + '" viewBox="0 0 680 50" aria-label="Position in the seven levels"></svg>' +
      '<div class="lvcols"><div style="display:grid;gap:10px">' +
      '<div class="box"><div class="lab">You arrive with</div><p class="small">' + L.arrive + '</p><div class="lab" style="margin-top:4px">You leave able to</div><ul class="tight small">' + L.leave.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
      '<div class="pcards">' + cards + "</div></div>" +
      '<div class="fig"><svg class="cmap" data-hl="' + n + '" viewBox="0 0 680 610" role="img" aria-label="Concept map with this level highlighted"></svg>' +
      '<p class="cap">' + (n === 7 ? "Synthesis uses the whole map." : "Filled: this level. Outlined: earlier levels. Faded: what comes later. Bold arrows touch this level.") + '<span class="web"> Choose a box to open it on the main map.</span></p></div></div>' +
      '<div class="lab">Check yourself at three depths</div>' +
      '<div class="qgrid">' + col("Learn", "suta", "recall the lists and terms", L.learn) + col("Reflect", "cintā", "connect and explain", L.reflect) + col("Observe", "bhāvanā", "find it in experience", L.observe) + "</div>" +
      '<div class="box"><h3>Common confusions</h3><ul class="conf">' + L.conf.map(function (c) { return "<li><span>" + c + "</span></li>"; }).join("") + "</ul></div>" +
      '<div class="pf"><span>Level ' + ROM[n] + " · " + L.name + " · " + range + '</span><span class="pg"></span></div>';
  });

  each("svg.ladder", function (svg) {
    var cur = +svg.getAttribute("data-lv"), s = "";
    for (var i = 1; i <= 7; i++) {
      var x = (i - 1) * 97 + 1, h = 8 + i * 3.4, y = 30 - h;
      var st = i === cur ? "fill:" + lvc(i) : (i < cur ? "fill:color-mix(in srgb, " + lvc(i) + " 30%, var(--sheet))" : "fill:none;stroke:var(--line)");
      var g = T("rect", { x: x, y: y, width: 93, height: h, rx: 2, style: st }) +
        T("text", { x: x, y: 44, "class": "tx-s" + (i === cur ? " tx-b" : " tx-mu") }, ROM[i] + " · " + LV[i].name);
      s += T("a", { href: "#L" + i }, g);
    }
    svg.innerHTML = s;
  });

  /* ---------------- nav strip on plates ---------------- */
  each("section.sheet", function (sec) {
    var m = /^p(\d+)$/.exec(sec.id);
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

  /* ---------------- plate 14: lens ---------------- */
  (function () {
    var svg = $("lens"); if (!svg) return;
    var L = [
      ["Two truths", [2], "Conventionally: “I see a mango and want it.” Ultimately: cittas, mental factors, an eye-base and a visible form, with no owner behind them."],
      ["Citta", [3], "Eye-consciousness: wholesome-resultant, rootless, with equanimity. Then javanas of the third greed-rooted citta: joyful, without wrong view, unprompted."],
      ["Cetasika", [4], "Eye-consciousness carries only the 7 universals. Each javana carries 18 factors, led by greed (lobha); conceit may join as a 19th."],
      ["Rūpa", [5], "Eye-sensitivity is kamma-born; the mango's colour is temperature-born. The javanas make mind-born matter: perhaps a smile, or a hand reaching out."],
      ["Process", [7], "A very great object: seeing at moment 5, the wanting in javanas 9–15, registration at 16–17, then back to the life-continuum."],
      ["Conditions", [8], "Eye-base: prenascence, support. Colour: object. Adverting: proximity. Greed: root. Each javana: repetition. Volition: kamma."],
      ["Dependent origination", [9], "Contact → feeling → craving. This is the second connection, where present results turn into present causes."],
      ["Kamma", [10], "Unwholesome kamma, by place. By time: J1 may ripen in this life, J7 in the next, J2–6 later. Repeated often, it becomes habitual kamma."],
      ["Planes", [11], "Unwholesome kamma that produces rebirth leads to a woeful plane; within a life it ripens as unwelcome experiences."],
      ["Practice", [12, 13], "Mindfulness notes “wanting”. Insight sees it arise and pass. Sensual desire is weakened at once-return and ended at non-return."]
    ];
    function wrap(t, n) {
      var w = t.split(" "), out = [], cur = "";
      w.forEach(function (x) { if ((cur + " " + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += " " + x; });
      if (cur.trim()) out.push(cur.trim());
      return out;
    }
    var cx = 340, cy = 310, R = 86, s = "", bw = 214, bh = 112;
    L.forEach(function (l, i) {
      var left = i < 5, k = i % 5;
      var x = left ? 0 : 680 - bw, y = 4 + k * 124, lv = PL[l[1][0]].lv;
      var ex = left ? x + bw : x, ey = y + bh / 2;
      var dx = ex - cx, dy = ey - cy, dd = Math.sqrt(dx * dx + dy * dy);
      s += T("line", { x1: f1(cx + dx / dd * R), y1: f1(cy + dy / dd * R), x2: ex, y2: ey, style: "stroke:" + lvc(lv) + ";stroke-width:1.4" });
      s += T("circle", { cx: ex, cy: ey, r: 3, style: "fill:" + lvc(lv) });
    });
    s += T("circle", { cx: cx, cy: cy, r: R, style: "fill:var(--nama-soft);stroke:var(--nama);stroke-width:1.6" });
    s += T("ellipse", { cx: cx, cy: cy - 30, rx: 22, ry: 28, transform: "rotate(-24 " + cx + " " + (cy - 30) + ")", style: "fill:var(--f-joy);stroke:var(--rupa);stroke-width:1.5" });
    s += T("path", { d: "M" + (cx + 8) + " " + (cy - 58) + " q14 -10 24 -2 q-12 10 -24 2", style: "fill:var(--f-ple);stroke:var(--nib);stroke-width:1" });
    s += T("text", { x: cx, y: cy + 18, "text-anchor": "middle", "class": "tx-l tx-d tx-b" }, "Seeing a ripe mango");
    s += T("text", { x: cx, y: cy + 35, "text-anchor": "middle", "class": "tx-l tx-d tx-b" }, "and wanting it");
    s += T("text", { x: cx, y: cy + 52, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "one ordinary moment, ten lenses");
    L.forEach(function (l, i) {
      var left = i < 5, k = i % 5;
      var x = left ? 0 : 680 - bw, y = 4 + k * 124, lv = PL[l[1][0]].lv;
      var g = T("rect", { x: x, y: y, width: bw, height: bh, rx: 6, style: "fill:var(--sheet);stroke:var(--line)" });
      g += T("rect", { x: left ? x : x + bw - 5, y: y, width: 5, height: bh, rx: 2, style: "fill:" + lvc(lv) });
      var tx = left ? x + 12 : x + 10;
      g += T("text", { x: tx, y: y + 18, "class": "tx-m tx-b" }, l[0]);
      var bx = left ? x + bw - 14 : x + bw - 18;
      l[1].slice().reverse().forEach(function (p, j) {
        var px = bx - j * 22;
        g += T("a", { href: "#p" + p }, T("circle", { cx: px, cy: y + 14, r: 9, style: "fill:" + lvc(PL[p].lv) }) + T("text", { x: px, y: y + 17.5, "text-anchor": "middle", "class": "tx-xs tx-b", style: "fill:var(--on-lv)" }, p));
      });
      wrap(l[2], 37).forEach(function (ln, j) { g += T("text", { x: tx, y: y + 36 + j * 12.6, "class": "tx-s", style: "font-size:9.8px" }, ln); });
      s += g;
    });
    svg.innerHTML = s;
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

    $("gloss").innerHTML = GL.map(function (g) { return "<div><i>" + g[0] + "</i> " + g[1] + " <span>· " + g[2] + "</span></div>"; }).join("");
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
      '<div class="nav"><a class="lvb" href="#L' + n + '" style="background:' + lvc(n) + ';border:0"><b>' + ROM[n] + "</b>" + L.name + "</a><span>Retells and reads " + range + '</span><span class="thrs"><span class="thr"><i style="background:var(--nama)"></i>the Buddha\'s life</span><span class="thr"><i style="background:var(--rupa-mark)"></i>Jātaka</span><span class="thr"><i style="background:var(--nib)"></i>disciples</span></span></div>' +
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
      LV[l].plates.forEach(function (p) { h += row("p" + p, p, PL[p].t); });
      h += '<a class="row" href="#D' + l + '"><b>◈</b><span>In 3D, then in the stories</span><span>' + pageOf["D" + l] + "–" + pageOf["S" + l] + "</span></a>";
      if (l === 7) h += row("threads", "↯", "Threads and glossary");
      h += "</div>";
    }
    h += '<div class="grp">' + row("explorer", "✎", "Study tools: one dhamma, many lenses", "h") + row("idcards", "✎", "Sixteen identity cards") + row("deck", "✎", "A review deck in five boxes") + "</div>";
    toc.innerHTML = h;
  })();
})();
