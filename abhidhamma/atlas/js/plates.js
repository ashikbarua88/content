(function () {
  "use strict";
  function A(o) { var s = ""; for (var k in o) if (o[k] !== undefined && o[k] !== null) s += " " + k + '="' + o[k] + '"'; return s; }
  function T(tag, o, inner) { return inner === undefined ? "<" + tag + A(o) + "/>" : "<" + tag + A(o) + ">" + inner + "</" + tag + ">"; }
  function $(id) { return document.getElementById(id); }
  function rad(d) { return d * Math.PI / 180; }
  function f1(n) { return Math.round(n * 10) / 10; }

  /* ---------- cover rings ---------- */
  (function () {
    var cx = 320, cy = 288;
    function rep(k, n) { var a = []; for (var i = 0; i < n; i++) a.push(k); return a; }
    var rings = [
      { r: 232, gap: 30, dot: 8.5, label: "54 sense-sphere", items: rep("bad", 12).concat(rep("res", 15), rep("fun", 3), rep("good", 8), rep("res", 8), rep("fun", 8)) },
      { r: 168, gap: 44, dot: 9.5, label: "15 fine-material", items: rep("good", 5).concat(rep("res", 5), rep("fun", 5)) },
      { r: 112, gap: 64, dot: 9.5, label: "12 immaterial", items: rep("good", 4).concat(rep("res", 4), rep("fun", 4)) },
      { r: 62, gap: 104, dot: 9.5, label: "8 supramundane", items: rep("path", 4).concat(rep("fruit", 4)) }
    ];
    var s = "";
    rings.forEach(function (g) {
      s += T("circle", { cx: cx, cy: cy, r: g.r, fill: "none", "class": "st-line", "stroke-width": 1 });
      var n = g.items.length, span = 360 - g.gap, start = -90 + g.gap / 2;
      g.items.forEach(function (k, i) {
        var a = rad(start + span * i / (n - 1));
        var x = f1(cx + g.r * Math.cos(a)), y = f1(cy + g.r * Math.sin(a));
        var st = { cx: x, cy: y, r: g.dot };
        if (k === "bad") st.style = "fill:var(--bad)";
        else if (k === "good") st.style = "fill:var(--nama)";
        else if (k === "res") st.style = "fill:var(--nama-2)";
        else if (k === "fun") st.style = "fill:var(--sheet);stroke:var(--muted);stroke-width:2";
        else if (k === "path") st.style = "fill:var(--nib)";
        else st.style = "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1.6";
        s += T("circle", st);
      });
      s += T("text", { x: cx, y: cy - g.r + 4, "text-anchor": "middle", "class": "tx-m tx-mu tx-b" }, g.label);
    });
    s += T("circle", { cx: cx, cy: cy, r: 25, style: "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1.5" });
    s += T("text", { x: cx, y: cy + 4, "text-anchor": "middle", "class": "tx-s tx-it tx-nb", style: "font-size:11px" }, "Nibbāna");
    $("cover-svg").innerHTML = s;
  })();

  /* ---------- plate 1: shelf ---------- */
  (function () {
    var books = [
      ["Dhammasaṅgaṇī", "Enumeration of phenomena", "Opens with the mātikā, 22 triads and 100 dyads, then analyses each kind of citta into its factors.", true],
      ["Vibhaṅga", "Book of analysis", "Eighteen chapters, most treated by the sutta method, the Abhidhamma method and by questions.", false],
      ["Dhātukathā", "Discussion of elements", "Shows how each dhamma is included in, or excluded from, the aggregates, bases and elements.", false],
      ["Puggalapaññatti", "Designation of persons", "Types of people. The one book about conventional rather than ultimate reality.", false],
      ["Kathāvatthu", "Points of controversy", "Refutes the views of other early schools in debate form.", false],
      ["Yamaka", "Book of pairs", "Pins down the scope of each term with paired, converse questions.", false],
      ["Paṭṭhāna", "Conditional relations", "Applies 24 conditions to every dhamma. The largest book, called the Great Treatise.", true]
    ];
    $("shelf").innerHTML = books.map(function (b, i) {
      return '<div class="book"><div class="spine' + (b[3] ? " key" : "") + '"><em>' + (i + 1) + "</em><span>" + b[0] + "</span></div><p><b>" + b[1] + "</b>" + b[2] + "</p></div>";
    }).join("");
  })();

  /* ---------- plate 2: from a person to dhammas ----------
     Three magnifications: a person → five aggregates (with the similes of SN 22.95) →
     four realities, with band widths by number of kinds → everything in one moment of seeing.
     Every part carries data-k keys; choosing a part lights up everything that shares a key. */
  (function () {
    var svg = $("p2-zoom"); if (!svg) return;
    var D = window.ATLAS, AG = D.aggregates, NOTE = D.aggregateNotes;
    var s = "", HALO = "paint-order:stroke;stroke:var(--sheet);stroke-width:3px;stroke-linejoin:round";
    function head(x, a, b) {
      return T("text", { x: x, y: 11, "class": "tx-xs tx-b tx-mu", style: "letter-spacing:.1em" }, a) + T("text", { x: x, y: 25, "class": "tx-s tx-it tx-mu" }, b);
    }
    s += head(0, "CONVENTION", "sammuti · what we say") + head(128, "FIVE AGGREGATES", "khandha · the suttas' analysis") + head(424, "FOUR REALITIES", "paramattha · the Abhidhamma's") + head(582, "ONE MOMENT", "of seeing a colour");

    /* column A: a person */
    var a = '<g data-k="person">';
    a += T("circle", { cx: 52, cy: 92, r: 15, style: "fill:var(--faint);stroke:var(--muted);stroke-width:1.4" });
    a += T("path", { d: "M24 170 C24 134 34 116 52 116 C70 116 80 134 80 170 Z", style: "fill:var(--faint);stroke:var(--muted);stroke-width:1.4" });
    a += T("text", { x: 52, y: 194, "text-anchor": "middle", "class": "tx-l tx-d tx-it" }, "“a person”");
    a += T("text", { x: 52, y: 210, "text-anchor": "middle", "class": "tx-s tx-mu" }, "one name, one body,");
    a += T("text", { x: 52, y: 222, "text-anchor": "middle", "class": "tx-s tx-mu" }, "one life story");
    ["“Why do you assume", "a ‘being’? This is", "a heap of", "formations.”"].forEach(function (ln, i) { a += T("text", { x: 4, y: 262 + i * 13, "class": "tx-s tx-it" }, ln); });
    a += T("text", { x: 4, y: 324, "class": "tx-xs tx-mu" }, "Nun Vajirā, SN 5.10");
    a += "</g>";
    s += a;
    /* brace: the person is made of the aggregates */
    s += T("path", { d: "M106 40 Q114 40 114 52 L114 214 Q114 226 121 226 Q114 226 114 238 L114 400 Q114 412 106 412", style: "fill:none;stroke:var(--muted);stroke-width:1.3" });

    /* column C geometry: blocks sized by number of kinds */
    var k = 1.75, gap = 16, y = 40, C = {};
    C.RU = { y0: y, y1: y + 28 * k }; y = C.RU.y1 + gap;
    C.CE = { y0: y, y1: y + 16 + 50 * k }; y = C.CE.y1 + gap;
    C.CI = { y0: y, y1: y + 89 * k }; y = C.CI.y1 + gap;
    C.NB = { y0: y, y1: y + 14 };
    var seg = { rupa: [C.RU.y0, C.RU.y1], vedana: [C.CE.y0, C.CE.y0 + 8], sanna: [C.CE.y0 + 8, C.CE.y0 + 16], sankhara: [C.CE.y0 + 16, C.CE.y1], vinnana: [C.CI.y0, C.CI.y1] };
    var XB = 314, XC = 424, WC = 22;

    /* bands and rows */
    var bands = "", rows = "";
    AG.forEach(function (g, i) {
      var y0 = 40 + i * 76, cy = y0 + 34, t = seg[g.k], mx = (XB + XC) / 2;
      var keys = g.k + (g.real === "CE" ? " ce" : "");
      bands += T("path", { "data-k": keys, d: "M" + XB + " " + (cy - 9) + " C" + mx + " " + (cy - 9) + " " + mx + " " + f1(t[0]) + " " + XC + " " + f1(t[0]) + " L" + XC + " " + f1(t[1]) + " C" + mx + " " + f1(t[1]) + " " + mx + " " + (cy + 9) + " " + XB + " " + (cy + 9) + " Z",
        style: "fill:var(" + g.c + ");fill-opacity:.32" });
      var r = '<g data-k="' + keys + '" class="p2-hit" tabindex="0" role="button" aria-label="' + g.en + ', ' + g.pali + ', like ' + g.simile + '">';
      r += T("rect", { x: 128, y: y0, width: 186, height: 68, rx: 6, style: "fill:var(--faint)" });
      r += T("rect", { x: 128, y: y0, width: 4, height: 68, rx: 2, style: "fill:var(" + g.c + ")" });
      r += glyph(g.g, 158, cy, g.c);
      r += T("text", { x: 188, y: y0 + 21, "class": "tx-l" }, '<tspan class="tx-it" style="font-size:15px">' + g.pali + '</tspan><tspan class="tx-s tx-mu"> ' + g.en + "</tspan>");
      r += T("text", { x: 188, y: y0 + 37, "class": "tx-m tx-it" }, "like " + g.simile);
      r += T("text", { x: 188, y: y0 + 54, "class": "tx-xs tx-mu" }, g.count);
      rows += r + "</g>";
    });
    s += bands + rows;

    /* column C: the four realities */
    function block(key, keys, b, fill, title, lines, cls) {
      var g = '<g data-k="' + keys + '" class="p2-hit" tabindex="0" role="button" aria-label="' + title + '">';
      g += T("rect", { x: XC, y: f1(b.y0), width: WC, height: f1(b.y1 - b.y0), rx: 2, style: fill });
      var cy = (b.y0 + b.y1) / 2, ty = key === "NB" ? b.y1 - 2 : cy - 2 - (lines.length - 1) * 6;
      g += T("text", { x: XC + WC + 8, y: f1(ty), "class": "tx-xl tx-d" + (cls || "") }, title);
      lines.forEach(function (ln, i) { g += T("text", { x: XC + WC + 8, y: f1(ty + 14 + i * 11.5), "class": "tx-xs" + (i ? " tx-mu" : "") }, ln); });
      return g + "</g>";
    }
    s += block("RU", "rupa", C.RU, "fill:var(--rupa-mark)", "Rūpa", ["28 kinds of matter"]);
    s += block("CE", "ce vedana sanna sankhara", C.CE, "fill:var(--nama-2)", "Cetasika", ["52 mental factors", "1 feeling, 1 perception,", "50 formations"]);
    s += T("line", { x1: XC, x2: XC + WC, y1: f1(seg.vedana[1]), y2: f1(seg.vedana[1]), style: "stroke:var(--sheet);stroke-width:1" }) + T("line", { x1: XC, x2: XC + WC, y1: f1(seg.sanna[1]), y2: f1(seg.sanna[1]), style: "stroke:var(--sheet);stroke-width:1" });
    s += block("CI", "vinnana", C.CI, "fill:var(--nama)", "Citta", ["89 kinds of consciousness", "121, counted in detail"]);
    s += block("NB", "nb", C.NB, "fill:none;stroke:var(--nib);stroke-width:1.6;stroke-dasharray:3 2", "Nibbāna", ["in no aggregate"], " tx-nb");
    /* nāma brace beside cetasika and citta */
    s += T("path", { d: "M" + (XC - 6) + " " + f1(C.CE.y0) + " L" + (XC - 9) + " " + f1(C.CE.y0) + " L" + (XC - 9) + " " + f1(C.CI.y1) + " L" + (XC - 6) + " " + f1(C.CI.y1), style: "fill:none;stroke:var(--nama);stroke-width:1.2" });
    s += T("text", { x: XC - 13, y: f1((C.CE.y0 + C.CI.y1) / 2), transform: "rotate(-90 " + (XC - 13) + " " + f1((C.CE.y0 + C.CI.y1) / 2) + ")", "text-anchor": "middle", "class": "tx-xs tx-nm tx-b", style: HALO }, "nāma · mind");

    /* column D: one moment of seeing */
    var X0 = 582, m = "";
    m += T("rect", { x: X0, y: 40, width: 98, height: 372, rx: 6, "data-k": "mo", "class": "p2-hit", tabindex: 0, role: "button", "aria-label": "One moment of seeing", style: "fill:var(--sheet);stroke:var(--line);stroke-dasharray:4 3" });
    m += '<g data-k="rupa mo">';
    m += T("rect", { x: X0 + 9, y: 52, width: 11, height: 11, rx: 2, style: "fill:var(--rupa-mark)" }) + T("text", { x: X0 + 25, y: 61, "class": "tx-xs" }, "eye-sensitivity");
    m += T("text", { x: X0 + 25, y: 72, "class": "tx-xs tx-mu" }, "the base");
    m += T("rect", { x: X0 + 9, y: 82, width: 11, height: 11, rx: 2, style: "fill:var(--rupa-mark);opacity:.6" }) + T("text", { x: X0 + 25, y: 91, "class": "tx-xs" }, "a colour");
    m += T("text", { x: X0 + 25, y: 102, "class": "tx-xs tx-mu" }, "the object");
    m += "</g>";
    m += '<g data-k="ce vedana sanna sankhara mo">';
    var U = [["contact", "sankhara"], ["feeling", "vedana"], ["perception", "sanna"], ["volition", "sankhara"], ["one-pointedness", "sankhara"], ["life faculty", "sankhara"], ["attention", "sankhara"]];
    U.forEach(function (u, i) {
      var yy = 128 + i * 12.5;
      m += '<g data-k="' + u[1] + ' ce mo">' + T("circle", { cx: X0 + 14, cy: yy - 3, r: 4, style: "fill:var(--nama-2)" }) + T("text", { x: X0 + 23, y: yy, "class": "tx-xs" }, u[0]) + "</g>";
    });
    m += T("text", { x: X0 + 9, y: 224, "class": "tx-xs tx-mu" }, "the 7 universals");
    m += "</g>";
    m += '<g data-k="vinnana mo">';
    m += T("circle", { cx: X0 + 49, cy: 290, r: 17, style: "fill:var(--nama)" });
    m += T("text", { x: X0 + 49, y: 294, "text-anchor": "middle", "class": "tx-s tx-b tx-onac" }, "1");
    m += T("text", { x: X0 + 49, y: 322, "text-anchor": "middle", "class": "tx-xs" }, "eye-");
    m += T("text", { x: X0 + 49, y: 333, "text-anchor": "middle", "class": "tx-xs" }, "consciousness");
    m += T("text", { x: X0 + 49, y: 345, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "a result of kamma");
    m += "</g>";
    m += '<g data-k="mo">' + T("text", { x: X0 + 49, y: 380, "text-anchor": "middle", "class": "tx-s tx-it" }, "and no seer");
    m += T("text", { x: X0 + 49, y: 393, "text-anchor": "middle", "class": "tx-s tx-it" }, "behind the seeing") + "</g>";
    s += m;
    svg.innerHTML = s;

    /* simile glyphs, drawn in the colour of their aggregate */
    function glyph(kind, x, y, c) {
      var st = "fill:none;stroke:var(" + c + ");stroke-width:1.4;stroke-linecap:round", g = "";
      if (kind === "foam") {
        [[-8, 2, 8], [3, -3, 9], [11, 4, 6], [-1, 8, 6], [-13, -5, 5], [6, -12, 4.5]].forEach(function (b) { g += T("circle", { cx: x + b[0], cy: y + b[1], r: b[2], style: "fill:var(--rupa-soft);stroke:var(" + c + ");stroke-width:1.2" }); });
        g += T("path", { d: "M" + (x - 20) + " " + (y + 17) + " q5 -4 10 0 t10 0 t10 0 t10 0", style: st });
      } else if (kind === "bubble") {
        g += T("circle", { cx: x, cy: y + 1, r: 11, style: "fill:var(--nama-soft);stroke:var(" + c + ");stroke-width:1.4" });
        g += T("path", { d: "M" + (x - 6) + " " + (y - 4) + " a7 7 0 0 1 6 -4", style: "fill:none;stroke:var(--sheet);stroke-width:2;stroke-linecap:round" });
        g += T("path", { d: "M" + (x - 20) + " " + (y + 15) + " q5 -4 10 0 t10 0 t10 0 t10 0", style: st });
        [[-14, -16], [13, -18], [17, -6]].forEach(function (d) { g += T("line", { x1: x + d[0], y1: y + d[1], x2: x + d[0] - 2, y2: y + d[1] + 6, style: st }); });
      } else if (kind === "mirage") {
        g += T("circle", { cx: x + 12, cy: y - 13, r: 5, style: "fill:none;stroke:var(" + c + ");stroke-width:1.4" });
        [-4, 3, 10].forEach(function (dy, i) { g += T("path", { d: "M" + (x - 19) + " " + (y + dy) + " q4.5 -3 9 0 t9 0 t9 0 t9 0", style: st + ";opacity:" + (1 - i * 0.25) }); });
        g += T("line", { x1: x - 20, y1: y + 17, x2: x + 20, y2: y + 17, style: st });
      } else if (kind === "plantain") {
        [16, 12, 8, 4].forEach(function (r, i) { g += T("ellipse", { cx: x, cy: y, rx: r, ry: r * 0.95, style: "fill:" + (i === 0 ? "var(--nama-soft)" : "none") + ";stroke:var(" + c + ");stroke-width:1.2" }); });
        g += T("circle", { cx: x, cy: y, r: 1.4, style: "fill:var(--sheet);stroke:var(" + c + ");stroke-width:.8;stroke-dasharray:1 1" });
      } else if (kind === "magic") {
        g += T("rect", { x: x - 9, y: y - 4, width: 18, height: 16, rx: 1.5, style: "fill:var(" + c + ")" });
        g += T("rect", { x: x - 14, y: y + 11, width: 28, height: 4, rx: 2, style: "fill:var(" + c + ")" });
        [[-11, -13, 4], [3, -18, 5], [14, -9, 3.5]].forEach(function (p) {
          var cx = x + p[0], cy = y + p[1], r = p[2];
          g += T("path", { d: "M" + cx + " " + (cy - r) + " L" + (cx + r * 0.3) + " " + (cy - r * 0.3) + " L" + (cx + r) + " " + cy + " L" + (cx + r * 0.3) + " " + (cy + r * 0.3) + " L" + cx + " " + (cy + r) + " L" + (cx - r * 0.3) + " " + (cy + r * 0.3) + " L" + (cx - r) + " " + cy + " L" + (cx - r * 0.3) + " " + (cy - r * 0.3) + " Z", style: "fill:var(--f-joy)" });
        });
      }
      return g;
    }

    /* choosing a part */
    var info = $("p2-info"), cur = null;
    var TITLE = { rupa: "Form · rūpa", vedana: "Feeling · vedanā", sanna: "Perception · saññā", sankhara: "Formations · saṅkhāra", vinnana: "Consciousness · viññāṇa", ce: "Cetasika · 52 mental factors", nb: "Nibbāna", mo: "One moment of seeing", person: "“A person”" };
    var PLATES = { ce: [4], nb: [2, 13], mo: [7, 14], person: [2] };
    AG.forEach(function (g) { PLATES[g.k] = g.p; });
    function noteOf(k) { var g = AG.filter(function (x) { return x.k === k; })[0]; return g ? g.note : (k === "person" ? "Nun Vajirā's answer to Māra: the word “being” is used when the aggregates are present, as “chariot” is used when its parts are assembled. The name is a convention for the heap on the right." : NOTE[k]); }
    function show(k) {
      cur = k;
      Array.prototype.forEach.call(svg.querySelectorAll("[data-k]"), function (el) {
        var ks = el.getAttribute("data-k").split(" ");
        el.style.opacity = !k || ks.indexOf(k) >= 0 || (k === "ce" && ks.some(function (x) { return x === "vedana" || x === "sanna" || x === "sankhara"; })) ? "" : 0.18;
      });
      if (!info) return;
      if (!k) { info.innerHTML = NOTE.none + '<span class="web"> Choose any part of the drawing to read it.</span>'; return; }
      info.innerHTML = "<b>" + TITLE[k] + ".</b> " + noteOf(k) + " " + PLATES[k].map(function (p) { return '<a class="xr" href="#p' + p + '">→ ' + p + "</a>"; }).join(" ");
    }
    function pick(e) {
      var el = e.target.closest("[data-k]"); if (!el) { show(null); return; }
      var ks = el.getAttribute("data-k").split(" "), k = ks[0];
      show(cur === k ? null : k);
    }
    svg.addEventListener("click", pick);
    svg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } if (e.key === "Escape") show(null); });
    show(null);
  })();

  /* ---------- plate 3: citta map (r2: named cells, click panel, print key, mango moment ringed) ---------- */
  var FEEL = { J: "var(--f-joy)", E: "var(--f-eq)", S: "var(--f-ple)", P: "var(--f-pain)", D: "var(--f-dis)" };
  (function () {
    var D = window.ATLAS, CC = D.cittaCodes, CT = {}; (D.cittas || []).forEach(function (c) { CT[c[0]] = c; });
    var MANGO = (D.mango && D.mango.cittas) || [];
    var rows = [
      { t: "Unwholesome", n: 12, g: [["greed-rooted", "JJJJEEEE"], ["hate-rooted", "DD"], ["delusion-rooted", "EE"]] },
      { t: "Rootless", n: 18, g: [["unwholesome-resultant", "EEEEPEE"], ["wholesome-resultant", "EEEESEJE"], ["functional", "EEJ"]] },
      { t: "Beautiful", n: 24, g: [["wholesome", "JJJJEEEE"], ["resultant", "JJJJEEEE"], ["functional", "JJJJEEEE"]] },
      { t: "Fine-material", n: 15, g: [["wholesome", "JJJJE"], ["resultant", "JJJJE"], ["functional", "JJJJE"]] },
      { t: "Immaterial", n: 12, g: [["wholesome", "EEEE"], ["resultant", "EEEE"], ["functional", "EEEE"]] },
      { t: "Supramundane", n: 8, g: [["path", "VVVV"], ["fruit", "VVVV"]] }
    ];
    var x0 = 138, cell = 19, step = 21, gg = 12, rowH = 50, y0 = 14, s = "", num = 1;
    s += T("defs", {}, T("clipPath", { id: "cl" }, T("rect", { width: cell, height: cell, rx: 3 })));
    rows.forEach(function (r, ri) {
      var y = y0 + ri * rowH + (ri >= 3 ? 10 : 0);
      s += T("text", { x: 28, y: y + 25, "class": "tx-l tx-d" }, r.t);
      s += T("text", { x: 28, y: y + 38, "class": "tx-s tx-mu" }, r.n + " cittas");
      var x = x0;
      r.g.forEach(function (g) {
        var label = g[0] + " " + g[1].length, lw = label.length * 4.6 + 10;
        s += T("text", { x: x, y: y + 10, "class": "tx-xs tx-mu" }, label);
        for (var i = 0; i < g[1].length; i++) {
          var f = g[1][i], cx = x + i * step, cyy = y + 16, c = CT[num], cell1 = "";
          if (f === "V") {
            cell1 += T("g", { transform: "translate(" + cx + "," + cyy + ")" },
              T("rect", { width: cell, height: cell, rx: 3, style: "fill:var(--f-eq)" }) +
              T("path", { d: "M0 0 H" + cell + " L0 " + cell + " Z", "clip-path": "url(#cl)", style: "fill:var(--f-joy)" }));
          } else cell1 += T("rect", { x: cx, y: cyy, width: cell, height: cell, rx: 3, style: "fill:" + FEEL[f] });
          if (MANGO.indexOf(num) >= 0) cell1 += T("rect", { x: cx - 2, y: cyy - 2, width: cell + 4, height: cell + 4, rx: 4.5, style: "fill:none;stroke:var(--ink);stroke-width:1.6" });
          cell1 += T("text", { x: cx + cell / 2, y: cyy + 13, "text-anchor": "middle", "class": "tx-xs " + (f === "D" ? "tx-on" : "tx-cell") }, num);
          cell1 += T("title", {}, "#" + num + (c ? " " + c[1] : ""));
          s += T("g", { "class": "p3-c", "data-n": num, tabindex: 0, role: "button", "aria-label": "#" + num + (c ? ", " + c[1] : "") }, cell1);
          num++;
        }
        x += Math.max(g[1].length * step + gg, lw);
      });
    });
    var yb = y0, ye = y0 + 3 * rowH - 6;
    s += T("path", { d: "M22 " + yb + " H16 V" + ye + " H22", fill: "none", "class": "st-mu", "stroke-width": 1 });
    s += T("text", { x: 11, y: (yb + ye) / 2, transform: "rotate(-90 11 " + (yb + ye) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "SENSE-SPHERE 54");
    var svg = $("citta-map");
    svg.innerHTML = s;

    /* on screen: choose a cell to read it (same pattern as Plate 2's panel) */
    var info = $("p3-info"), cur = null;
    var NOTE = { 30: "An arahant smiles with this citta or with one of the four joyful great functional cittas (#47–50); none of them makes kamma.",
      29: "The same citta adverts at the mind door and determines in a five-door process (Plate 7, moment 8).",
      19: "Investigating with equanimity also serves as rebirth-linking, life-continuum and death for beings in the woeful planes.",
      27: "Also the rebirth-linking, life-continuum and death of humans and devas reborn without roots." };
    function fnList(c) { return c[3].split(" ").map(function (k) { return CC.fn[k]; }); }
    function show(n) {
      cur = n;
      Array.prototype.forEach.call(svg.querySelectorAll(".p3-c"), function (g) { g.style.opacity = !n || +g.getAttribute("data-n") === n ? "" : 0.35; });
      if (!info) return;
      if (!n || !CT[n]) { info.innerHTML = 'Choose any square to read that citta: its roots, feeling, factors, the jobs it can do, its doors, base and objects. <b>Ringed:</b> the six cittas of the mango moment <a class="xr" href="#p7">→ 7</a>.'; return; }
      var c = CT[n], roots = c[7] ? c[7].split("").map(function (k) { return CC.root[k]; }).join(", ") : "none (rootless)";
      var pl = c[9].split("").map(function (k) { return CC.plane[k]; }).join(c[9].length > 2 ? ", " : " and "), ps = c[10].split("").map(function (k) { return CC.person[k]; }).join(", ");
      var obj = c[6].split(" ").map(function (k) { return CC.obj[k]; }).join("; or ");
      info.innerHTML = "<b>#" + n + " · " + c[1] + ".</b> Feeling: " + CC.feel[c[2]] + ". Roots: " + roots + ". Mental factors: " + c[8] + " <a class='xr' href='#p4'>→ 4</a>. " +
        "Jobs: " + fnList(c).join(", ") + " <a class='xr' href='#p3b'>→ 3b</a>. Doors: " + CC.door[c[4]] + ". Base: " + CC.base[c[5]] + ". Object: " + obj + ". " +
        "Occurs in processes in the " + pl + (c[9].length > 1 ? " planes" : " planes") + ", in " + ps + "." + (NOTE[n] ? " " + NOTE[n] : "");
    }
    function pick(e) { var g = e.target.closest(".p3-c"); if (!g) { show(null); return; } var n = +g.getAttribute("data-n"); show(cur === n ? null : n); }
    svg.addEventListener("click", pick);
    svg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e); } if (e.key === "Escape") show(null); });
    show(null);

    /* the key: how the numbers are ordered (printed) */
    var key = $("p3-key");
    if (key) {
      var k = "";
      var e8 = "";
      for (var i = 0; i < 8; i++) {
        e8 += T("rect", { x: 4 + i * 21, y: 30, width: 19, height: 19, rx: 3, style: "fill:" + (i < 4 ? "var(--f-joy)" : "var(--f-eq)") });
        e8 += T("text", { x: 13.5 + i * 21, y: 43, "text-anchor": "middle", "class": "tx-xs tx-cell" }, i + 1);
        e8 += T("text", { x: 13.5 + i * 21, y: 60, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "font-size:7.5px" }, i % 2 ? "P" : "U");
      }
      e8 += T("path", { d: "M5 24 v-3 H86 v3 M89 24 v-3 H170 v3", style: "fill:none;stroke:var(--muted);stroke-width:.8" });
      e8 += T("text", { x: 45, y: 17, "text-anchor": "middle", "class": "tx-xs tx-b" }, "with joy") + T("text", { x: 129, y: 17, "text-anchor": "middle", "class": "tx-xs tx-b" }, "with equanimity");
      e8 += T("text", { x: 45, y: 7, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "font-size:7.5px" }, "1–2 with · 3–4 without") + T("text", { x: 129, y: 7, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "font-size:7.5px" }, "5–6 with · 7–8 without");
      k += '<div class="p3k-8"><svg viewBox="0 -4 176 68" role="img" aria-label="A block of eight: joy 1 to 4, equanimity 5 to 8; with then without; unprompted then prompted">' + e8 + "</svg>" +
        '<p>Blocks of eight (#1–8, 31–38, 39–46, 47–54) run alike. <b>With</b>: wrong view (greed) or knowledge (beautiful). <b>U</b> unprompted, <b>P</b> prompted, arising with urging.</p></div>';
      k += '<div><b>Unwholesome.</b> 9–10 hate (unprompted, prompted); 11 delusion with doubt; 12 delusion with restlessness.</div>';
      k += '<div><b>Rootless.</b> 13–17 eye, ear, nose, tongue, body consciousness; 18 receiving; 19 investigating. 20–27 the same, wholesome-resultant, with investigating twice (26 joy, 27 equanimity). 28 five-door adverting, 29 mind-door adverting, 30 the arahant\'s smile.</div>';
      k += '<div><b>Higher.</b> Jhāna blocks run 1st to 5th jhāna; immaterial: infinite space, infinite consciousness, nothingness, neither perception nor non-perception; path and fruit: stream-entry, once-return, non-return, arahantship.</div>';
      key.innerHTML = k;
    }

    var counts = [["J", 62, "joy"], ["E", 55, "equanimity"], ["D", 2, "displeasure"], ["S", 1, "pleasure"], ["P", 1, "pain"]];
    var w = "", idx = 0, c = 14, st = 16;
    counts.forEach(function (k) {
      for (var i = 0; i < k[1]; i++) {
        var col = idx % 11, row = Math.floor(idx / 11);
        w += T("rect", { x: 6 + col * st, y: 6 + row * st, width: c, height: c, rx: 2, style: "fill:" + FEEL[k[0]] });
        idx++;
      }
    });
    var ly = 22;
    counts.forEach(function (k) {
      w += T("rect", { x: 196, y: ly - 9, width: 10, height: 10, rx: 2, style: "fill:" + FEEL[k[0]] });
      w += T("text", { x: 212, y: ly, "class": "tx-m" }, k[1] + " " + k[2]);
      ly += 20;
    });
    w += T("text", { x: 196, y: 140, "class": "tx-s tx-mu" }, "121 cittas,");
    w += T("text", { x: 196, y: 153, "class": "tx-s tx-mu" }, "one square each");
    $("waffle").innerHTML = w;
  })();

  /* ---------- r2: plate 3b, what each citta does (CMA III: functions, doors, physical bases) ----------
     Data: D.cittas (from the rule model; the counts agree with r2/research/sheet3b.json).
     Top: the five-door track of Plate 7 with how many cittas can fill each slot on that track.
     Middle: the 89 (Plate 3 order) against the 14 functions; the three process-freed functions are
     kept apart above the eleven process functions; then doors and physical base (vatthu) per citta.
     On screen, choose a row to light its cittas and read them; choose a column to read the citta. */
  (function () {
    var svg = $("fn-grid"), trk = $("fn-track"); if (!svg) return;
    var D = window.ATLAS, CC = D.cittaCodes, CT = {}; D.cittas.forEach(function (c) { CT[c[0]] = c; });
    /* --- the five-door track --- */
    var TRACK = [["life-continuum", "bh", "1 of 19", "this life's own", 1], ["adverting", "pa", "1", "#28", 1], ["seeing", "vi", "2", "#13 · 20", 1], ["receiving", "pr", "2", "#18 · 25", 1],
      ["investigating", "pr", "3", "#19 · 26 · 27", 1], ["determining", "pr", "1", "#29", 1], ["javana", "ja", "29", "#1–12 · 30 · 31–38 · 47–54", 7], ["registration", "ta", "11", "#19 · 26 · 27 · 39–46", 2], ["life-continuum", "bh", "1", "the same one", 1]];
    var FILL = { bh: "fill:var(--faint);stroke:var(--line)", pa: "fill:var(--nama-soft);stroke:var(--nama-2)", pr: "fill:var(--nama-soft);stroke:var(--nama-2)", vi: "fill:var(--sheet);stroke:var(--nama);stroke-width:1.6", ja: "fill:var(--nama);stroke:var(--nama)", ta: "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:2 1.5" };
    var t = "", x = 0, W = [68, 56, 56, 56, 72, 60, 130, 92, 64];
    TRACK.forEach(function (k, i) {
      var w = W[i] - 6;
      t += T("rect", { x: x, y: 16, width: w, height: 22, rx: 4, style: FILL[k[1]] });
      t += T("text", { x: x + w / 2, y: 31, "text-anchor": "middle", "class": "tx-s tx-b" + (k[1] === "ja" ? " tx-onac" : "") }, k[2]);
      t += T("text", { x: x + w / 2, y: 10, "text-anchor": "middle", "class": "tx-xs" }, k[0] + (k[4] > 1 ? " ×" + k[4] : ""));
      t += T("text", { x: x + w / 2, y: 50, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "font-size:7.6px" }, k[3]);
      x += W[i];
    });
    t += T("text", { x: 0, y: 64, "class": "tx-xs tx-mu" }, "the number in each slot: how many of the 89 can fill it on an eye-door track (any one sense door: 46 cittas in all)");
    if (trk) trk.innerHTML = t;

    /* --- the grid --- */
    var ROWS = [["RL", "rebirth-linking", "paṭisandhi"], ["BH", "life-continuum", "bhavaṅga"], ["DE", "death", "cuti"], null,
      ["AD", "adverting", "āvajjana"], ["SE", "seeing", "dassana"], ["HE", "hearing", "savana"], ["SM", "smelling", "ghāyana"], ["TA", "tasting", "sāyana"], ["TO", "touching", "phusana"],
      ["RC", "receiving", "sampaṭicchana"], ["IN", "investigating", "santīraṇa"], ["DT", "determining", "voṭṭhapana"], ["JV", "javana", "javana"], ["RG", "registration", "tadārammaṇa"]];
    var GROUPS = [[1, 8], [9, 10], [11, 12], [13, 19], [20, 27], [28, 30], [31, 38], [39, 46], [47, 54], [55, 59], [60, 64], [65, 69], [70, 73], [74, 77], [78, 81], [82, 85], [86, 89]];
    var BAND = [["unwholesome 12", 1, 12], ["rootless 18", 13, 30], ["beautiful 24", 31, 54], ["fine-material 15", 55, 69], ["immaterial 12", 70, 81], ["supra. 8", 82, 89]];
    var X0 = 86, CW = 5, GAP = 2, colX = {}, xx = X0;
    GROUPS.forEach(function (g, gi) { for (var n = g[0]; n <= g[1]; n++) { colX[n] = xx; xx += CW + 0.8; } xx += GAP + (gi === 2 || gi === 5 || gi === 8 || gi === 11 || gi === 14 ? 2.5 : 0); });
    var XE = xx, RH = 11.5, Y0 = 34, s = "";
    /* kind of citta → colour (as on the cover) */
    function kind(n) { if (n <= 12) return "bad"; if (n <= 19 || (n >= 39 && n <= 46) || (n >= 60 && n <= 64) || (n >= 74 && n <= 77) || (n >= 20 && n <= 27)) return "res"; if (n >= 82 && n <= 85) return "path"; if (n >= 86) return "fruit"; if (n === 28 || n === 29 || n === 30 || (n >= 47 && n <= 54) || (n >= 65 && n <= 69) || n >= 78) return "fun"; return "good"; }
    var KF = { bad: "fill:var(--bad)", good: "fill:var(--nama)", res: "fill:var(--nama-2)", fun: "fill:var(--sheet);stroke:var(--nama);stroke-width:1", path: "fill:var(--nib)", fruit: "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1" };
    /* column bands and numbers */
    BAND.forEach(function (b) {
      var a = colX[b[1]], e = colX[b[2]] + CW;
      s += T("path", { d: "M" + f1(a) + " 16 v-3 H" + f1(e) + " v3", style: "fill:none;stroke:var(--muted);stroke-width:.8" });
      s += T("text", { x: f1((a + e) / 2), y: 9, "text-anchor": "middle", "class": "tx-xs tx-mu" }, b[0]);
    });
    [1, 9, 13, 20, 28, 31, 39, 47, 55, 60, 65, 70, 74, 78, 82, 86].forEach(function (n) { s += T("text", { x: f1(colX[n] + CW / 2), y: 27, "text-anchor": "middle", "class": "tx-mu", style: "font-size:6.4px" }, n); });
    var y = Y0, rowY = {};
    ROWS.forEach(function (r) {
      if (!r) { y += 9; s += T("text", { x: 0, y: y - 2.5, "class": "tx-xs tx-mu tx-b", style: "font-size:7px;letter-spacing:.05em" }, "IN A PROCESS"); return; }
      rowY[r[0]] = y;
      var members = D.cittas.filter(function (c) { return c[3].split(" ").indexOf(r[0]) >= 0; }).map(function (c) { return c[0]; });
      var g = T("rect", { x: 0, y: y - 1, width: XE + 34, height: RH, rx: 2, "class": "fn-bg", style: "fill:transparent" });
      g += T("text", { x: 0, y: y + 7.8, "class": "tx-s" }, r[1]) + T("title", {}, r[2]);
      for (var n = 1; n <= 89; n++) {
        var on = members.indexOf(n) >= 0;
        g += T("rect", { x: f1(colX[n]), y: y + 1, width: CW, height: RH - 3, rx: 1, style: on ? KF[kind(n)] : "fill:var(--faint)" });
      }
      g += T("text", { x: XE + 8, y: y + 8, "class": "tx-s tx-b" }, members.length);
      s += T("g", { "class": "fn-row", "data-f": r[0], tabindex: 0, role: "button", "aria-label": r[1] + ": " + members.length + " cittas" }, g + T("title", {}, r[1] + ": " + members.length + " cittas, #" + members.join(", #")));
      y += RH;
    });
    s += T("text", { x: XE + 8, y: Y0 - 4, "class": "tx-mu", style: "font-size:6.4px" }, "in all");
    /* brace for the process-freed three */
    s += T("text", { x: 0, y: Y0 - 4, "class": "tx-xs tx-mu tx-b", style: "font-size:7px;letter-spacing:.05em" }, "PROCESS-FREED");
    /* jobs per citta */
    y += 4;
    s += T("text", { x: 0, y: y + 9, "class": "tx-s tx-b" }, "jobs per citta");
    var nf = {}; D.cittas.forEach(function (c) { nf[c[0]] = c[3].split(" ").length; });
    for (var n = 1; n <= 89; n++) s += T("rect", { x: f1(colX[n]), y: f1(y + 16 - nf[n] * 3), width: CW, height: nf[n] * 3, style: "fill:var(--muted)" + (nf[n] > 1 ? "" : ";opacity:.4") });
    s += T("text", { x: XE + 8, y: y + 13, "class": "tx-mu", style: "font-size:6.6px" }, "1–5");
    y += 22;
    /* doors */
    var DOORF = { "1": "fill:var(--line)", "5": "fill:var(--nama-2);opacity:.55", "6": "fill:var(--nama)", "6f": "fill:var(--nama);opacity:.5", f: "fill:none;stroke:var(--muted);stroke-width:.8" };
    s += T("text", { x: 0, y: y + 8, "class": "tx-s tx-b" }, "doors");
    for (n = 1; n <= 89; n++) s += T("rect", { x: f1(colX[n]), y: y + 1, width: CW, height: RH - 3, rx: 1, style: DOORF[CT[n][4]] });
    y += RH + 2;
    /* physical base, vatthu */
    var BASEF = { s: "fill:var(--rupa-mark)", h: "fill:var(--rupa-soft);stroke:var(--rupa-mark);stroke-width:1.1", hn: "fill:none;stroke:var(--rupa-mark);stroke-width:.9;stroke-dasharray:1.6 1", n: "fill:none;stroke:var(--muted);stroke-width:.8;stroke-dasharray:1.5 1" };
    s += T("text", { x: 0, y: y + 8, "class": "tx-s tx-b" }, "base") + T("text", { x: 28, y: y + 8, "class": "tx-it tx-mu", style: "font-size:7.6px" }, "vatthu");
    for (n = 1; n <= 89; n++) s += T("rect", { x: f1(colX[n]), y: y + 1, width: CW, height: RH - 3, rx: 1, style: BASEF[CT[n][5]] });
    y += RH + 4;
    svg.setAttribute("viewBox", "0 0 680 " + Math.ceil(y));
    /* column hit areas */
    for (n = 1; n <= 89; n++) s += T("rect", { x: f1(colX[n] - 0.4), y: Y0, width: CW + 0.8, height: f1(y - Y0), "class": "fn-col", "data-n": n, style: "fill:transparent" }, T("title", {}, "#" + n + " " + CT[n][1]));
    svg.innerHTML = s;

    var info = $("fn-info"), cur = null;
    function show(f, n) {
      Array.prototype.forEach.call(svg.querySelectorAll(".fn-row"), function (g) { g.style.opacity = !f || g.getAttribute("data-f") === f ? "" : 0.3; });
      if (!info) return;
      if (n) { var c = CT[n]; info.innerHTML = "<b>#" + n + " · " + c[1] + ".</b> Jobs: " + c[3].split(" ").map(function (k) { return CC.fn[k]; }).join(", ") + ". Doors: " + CC.door[c[4]] + ". Base: " + CC.base[c[5]] + ". <a class='xr' href='#p3'>→ 3</a>"; return; }
      if (!f) { info.innerHTML = "Choose a row to light the cittas that can do that job, or a column to read one citta."; return; }
      var r = ROWS.filter(function (x) { return x && x[0] === f; })[0], m = D.cittas.filter(function (c) { return c[3].split(" ").indexOf(f) >= 0; });
      info.innerHTML = "<b>" + r[1] + "</b> (<i>" + r[2] + "</i>): " + m.length + " cittas. " + m.map(function (c) { return "#" + c[0]; }).join(", ") + ".";
    }
    svg.addEventListener("click", function (e) {
      var col = e.target.closest(".fn-col"), row = null;
      var rs = svg.querySelectorAll(".fn-row"), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var lp = pt.matrixTransform(svg.getScreenCTM().inverse());
      Array.prototype.forEach.call(rs, function (g) { var f = g.getAttribute("data-f"); if (lp.y >= rowY[f] - 1 && lp.y < rowY[f] + RH - 1) row = f; });
      if (lp.x < X0 - 4 && row) { cur = cur === row ? null : row; show(cur); return; }
      if (col) { show(row, +col.getAttribute("data-n")); return; }
      show(null);
    });
    svg.addEventListener("keydown", function (e) { var g = e.target.closest(".fn-row"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); var f = g.getAttribute("data-f"); cur = cur === f ? null : f; show(cur); } });
    show(null);
  })();

  /* ---------- plate 4: ensemble (r2: English labels in columns, subgroup arcs, unfixed factors, stacked totals) ---------- */
  (function () {
    var cx = 340, cy = 192, RO = 150, RC = 88, RU = 46, s = "";
    var UNI = [["contact", "phassa"], ["feeling", "vedanā"], ["perception", "saññā"], ["volition", "cetanā"], ["one-pointedness", "ekaggatā"], ["life faculty", "jīvitindriya"], ["attention", "manasikāra"]];
    var OCC = [["applied thought", "vitakka", -122], ["sustained thought", "vicāra", -90], ["decision", "adhimokkha", -58], ["energy", "viriya", 58], ["zest", "pīti", 90], ["desire to act", "chanda", 122]];
    /* [group label, items]; item = [English, Pāli, dots, unfixed] */
    var BAD = [
      ["In every unwholesome citta · 4", [["delusion", "moha", 1], ["shamelessness", "ahirika", 1], ["fearlessness of wrong", "anottappa", 1], ["restlessness", "uddhacca", 1]]],
      ["Greed group · 3", [["greed", "lobha", 1], ["wrong view", "diṭṭhi", 1], ["conceit", "māna", 1, 1]]],
      ["Hate group · 4", [["hatred", "dosa", 1], ["envy", "issā", 1, 1], ["avarice", "macchariya", 1, 1], ["worry", "kukkucca", 1, 1]]],
      ["Sloth and torpor · 2", [["sloth", "thīna", 1, 1], ["torpor", "middha", 1, 1]]],
      ["Doubt · 1", [["doubt", "vicikicchā", 1]]]
    ];
    var GOOD = [
      ["In every beautiful citta · 19", [["faith", "saddhā", 1], ["mindfulness", "sati", 1], ["shame of wrong", "hiri", 1], ["fear of wrong", "ottappa", 1], ["non-greed", "alobha", 1], ["non-hatred", "adosa", 1], ["neutrality of mind", "tatramajjhattatā", 1],
        ["tranquillity ×2", "passaddhi", 2], ["lightness ×2", "lahutā", 2], ["malleability ×2", "mudutā", 2], ["wieldiness ×2", "kammaññatā", 2], ["proficiency ×2", "pāguññatā", 2], ["rectitude ×2", "ujjukatā", 2]]],
      ["Abstinences · 3", [["right speech", "sammā-vācā", 1, 1], ["right action", "sammā-kammanta", 1, 1], ["right livelihood", "sammā-ājīva", 1, 1]]],
      ["Illimitables · 2", [["compassion", "karuṇā", 1, 1], ["appreciative joy", "muditā", 1, 1]]],
      ["Wisdom · 1", [["wisdom", "paññindriya", 1]]]
    ];
    function P(r, a) { return [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]; }
    /* outer ring: spread the dots of each side over an arc, leaving a gap between subgroups */
    function side(groups, a0, a1, colX, anchor, colour, cls) {
      var nDots = 0, nGaps = groups.length - 1;
      groups.forEach(function (g) { g[1].forEach(function (it) { nDots += it[2]; }); });
      var unit = (a1 - a0) / (nDots - 1 + nGaps * 0.6), a = a0, rows = 0;
      groups.forEach(function (g) { rows += 1 + g[1].length; });
      var pitch = 13.6, hp = 14, H = groups.length * hp + (rows - groups.length) * pitch, y = Math.max(10, cy - H / 2), out = "";
      groups.forEach(function (g, gi) {
        var arcFrom = a;
        out += T("text", { x: colX, y: f1(y + 8), "text-anchor": anchor, "class": "tx-xs tx-b " + cls, style: "letter-spacing:.04em" }, g[0].toUpperCase());
        y += hp;
        g[1].forEach(function (it) {
          var ly = y + 7;
          for (var d = 0; d < it[2]; d++) {
            var p = P(RO, a), lx = anchor === "end" ? colX + 4 : colX - 4;
            out += T("line", { x1: f1(p[0]), y1: f1(p[1]), x2: lx, y2: f1(ly - 3), style: "stroke:var(--line);stroke-width:.8" });
            out += T("circle", { cx: f1(p[0]), cy: f1(p[1]), r: 4.6, style: it[3] ? "fill:var(--sheet);stroke:" + colour + ";stroke-width:1.4;stroke-dasharray:2 1.4" : "fill:" + colour });
            a += unit;
          }
          out += T("text", { x: colX, y: f1(ly), "text-anchor": anchor, "class": "tx-s" }, anchor === "end" ? '<tspan class="tx-it tx-mu" style="font-size:8.6px">' + it[1] + "</tspan> · " + it[0] : it[0] + ' · <tspan class="tx-it tx-mu" style="font-size:8.6px">' + it[1] + "</tspan>");
          y += pitch;
        });
        var arcTo = a - unit, rr = RO + 11, p0 = P(rr, arcFrom - 2.5), p1 = P(rr, arcTo + 2.5), sweep = a1 > a0 ? 1 : 0;
        out += T("path", { d: "M" + f1(p0[0]) + " " + f1(p0[1]) + " A" + rr + " " + rr + " 0 0 " + sweep + " " + f1(p1[0]) + " " + f1(p1[1]), style: "fill:none;stroke:" + colour + ";stroke-width:3.4;stroke-linecap:round;opacity:" + (gi % 2 ? 0.5 : 1) });
        a += unit * 0.6;
      });
      return out;
    }
    [RU, RC, RO].forEach(function (r) { s += T("circle", { cx: cx, cy: cy, r: r, fill: "none", "class": "st-line" }); });
    s += side(GOOD, -72, 76, 516, "start", "var(--nama)", "tx-nm");
    s += side(BAD, 252, 104, 164, "end", "var(--bad)", "tx-bd");
    /* the 6 occasionals: either side */
    OCC.forEach(function (o) {
      var p = P(RC, o[2]), up = o[2] < 0, lp = [p[0], p[1] + (up ? -2 : 6)], anc = "middle";
      s += T("circle", { cx: f1(p[0]), cy: f1(p[1]), r: 4.6, style: "fill:var(--nama-2)" });
      var ty = up ? lp[1] - 9 : lp[1] + 6;
      s += T("text", { x: f1(lp[0]), y: f1(ty), "text-anchor": anc, "class": "tx-xs" }, o[0]) + T("text", { x: f1(lp[0]), y: f1(ty + 8), "text-anchor": anc, "class": "tx-it tx-mu", style: "font-size:7.4px" }, o[1]);
    });
    /* the 7 universals round citta */
    UNI.forEach(function (u, i) {
      var a = -90 + i * 360 / 7, p = P(RU, a), lp = P(RU + 8, a), c = Math.cos(rad(a));
      var anc = Math.abs(c) < 0.3 ? "middle" : (c > 0 ? "start" : "end"), dy = Math.sin(rad(a)) < -0.6 ? -6 : (Math.sin(rad(a)) > 0.6 ? 9 : 3);
      s += T("circle", { cx: f1(p[0]), cy: f1(p[1]), r: 4.2, style: "fill:var(--nama)" });
      s += T("text", { x: f1(lp[0]), y: f1(lp[1] + dy), "text-anchor": anc, "class": "tx-xs", style: "font-size:7.8px" }, u[0]) + T("title", {}, u[1]);
    });
    s += T("circle", { cx: cx, cy: cy, r: 22, style: "fill:var(--nama)" });
    s += T("text", { x: cx, y: cy + 4.5, "text-anchor": "middle", "class": "tx-l tx-it tx-onac" }, "citta");
    /* labels for the rings, and the wall between the families */
    s += T("line", { x1: cx, y1: cy - RO + 20, x2: cx, y2: cy - RC - 30, "class": "st-mu", "stroke-dasharray": "3 3" });
    s += T("line", { x1: cx, y1: cy + RC + 26, x2: cx, y2: cy + RO - 2, "class": "st-mu", "stroke-dasharray": "3 3" });
    s += T("text", { x: cx - 8, y: cy - RO - 14, "text-anchor": "end", "class": "tx-m tx-b tx-bd" }, "UNWHOLESOME 14") + T("text", { x: cx + 8, y: cy - RO - 14, "class": "tx-m tx-b tx-nm" }, "BEAUTIFUL 25") + T("line", { x1: cx, y1: cy - RO - 26, x2: cx, y2: cy - RO + 4, "class": "st-mu" });
    s += T("text", { x: cx, y: cy - RO + 14, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "paint-order:stroke;stroke:var(--sheet);stroke-width:3px" }, "never in one citta");
    $("ensemble").innerHTML = s;

    /* totals, stacked by family; dashed parts may join, one at a time */
    var SEG = { u: ["var(--nama-2)", "", "universals"], o: ["var(--nama-soft)", "var(--nama-2)", "occasionals"], x: ["var(--bad)", "", "unwholesome universals"], g: ["var(--bad)", "", "greed"],
      b: ["var(--nama)", "", "beautiful universals"], w: ["var(--th10)", "", "wisdom"], a: ["var(--nama)", "", "abstinences (fixed in path)"] };
    var bars = [
      ["#20 seeing", [["u", 7]]], ["#28 five-door adverting", [["u", 7], ["o", 3]]], ["#26 investigating, with joy", [["u", 7], ["o", 4]]], ["#30 the arahant's smile", [["u", 7], ["o", 5]]],
      ["#12 delusion, restlessness", [["u", 7], ["o", 4], ["x", 4]]], ["#3 greed, joy (the mango javana)", [["u", 7], ["o", 6], ["x", 4], ["g", 1]], [["conceit", 1]]],
      ["#59 fifth jhāna, wholesome", [["u", 7], ["o", 3], ["b", 19], ["w", 1]]], ["#55 first jhāna, wholesome", [["u", 7], ["o", 6], ["b", 19], ["w", 1]], [["+2", 2]]],
      ["#82 path, at the first jhāna", [["u", 7], ["o", 6], ["b", 19], ["w", 1], ["a", "+3"]]], ["#31 great wholesome, first", [["u", 7], ["o", 6], ["b", 19], ["w", 1]], [["+3", 3], ["+2", 2]]]
    ];
    var b = "", lx = 196, sc = 10.6, h = 14, gap = 18;
    [10, 20, 30].forEach(function (v) { b += T("line", { x1: lx + v * sc, y1: 0, x2: lx + v * sc, y2: bars.length * gap, "class": "st-line" }); });
    bars.forEach(function (r, i) {
      var y = i * gap + 3, x = lx, tot = 0, may = 0;
      b += T("text", { x: lx - 8, y: y + 11.5, "text-anchor": "end", "class": "tx-m" }, r[0]);
      r[1].forEach(function (sg) {
        var S = SEG[sg[0]], cnt = parseInt(sg[1], 10) || 3, w = (typeof sg[1] === "string" ? 3 : sg[1]) * sc;
        b += T("rect", { x: f1(x), y: y, width: f1(w - 1), height: h, rx: 2, style: "fill:" + S[0] + (S[1] ? ";stroke:" + S[1] : "") + (sg[0] === "g" ? ";opacity:.7" : "") });
        if (w >= 14) b += T("text", { x: f1(x + w / 2 - .5), y: y + 11, "text-anchor": "middle", "class": "tx-xs tx-b", style: "fill:" + (sg[0] === "o" ? "var(--ink)" : "var(--on-accent)") }, sg[1]);
        x += w; tot += typeof sg[1] === "string" ? 3 : sg[1];
      });
      (r[2] || []).forEach(function (m) {
        var w = m[1] * sc;
        b += T("rect", { x: f1(x + .5), y: y + .5, width: f1(w - 1.5), height: h - 1, rx: 2, style: "fill:var(--sheet);stroke:var(--nama);stroke-dasharray:3 2" + (m[0] === "conceit" ? ";stroke:var(--bad)" : "") });
        b += T("text", { x: f1(x + w / 2), y: y + 11, "text-anchor": "middle", "class": "tx-xs", style: "font-size:7.5px" }, m[0] === "conceit" ? "+1" : m[0]);
        x += w; may += m[1];
      });
      b += T("text", { x: f1(x + 6), y: y + 11.5, "class": "tx-m tx-b" }, (tot + may) + (may ? "  (" + tot + " + " + may + ")" : ""));
    });
    $("factor-bars").innerHTML = b;
  })();

  /* ---------- plate 5: similes ---------- */
  (function () {
    var C = 'style="fill:none;stroke:var(--nama);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"';
    var F = 'style="fill:var(--nama-soft);stroke:var(--nama);stroke-width:2"';
    var icons = {
      rams: '<path ' + C + ' d="M8 44 Q12 26 26 30 L30 36"/><path ' + C + ' d="M56 44 Q52 26 38 30 L34 36"/><circle ' + F + ' cx="22" cy="28" r="6"/><circle ' + F + ' cx="42" cy="28" r="6"/><path ' + C + ' d="M32 14 V20 M26 16 L29 21 M38 16 L35 21"/>',
      crown: '<path ' + F + ' d="M12 44 L10 20 L22 32 L32 14 L42 32 L54 20 L52 44 Z"/><path ' + C + ' d="M12 52 H52"/>',
      mark: '<rect ' + F + ' x="6" y="24" width="52" height="18" rx="9"/><path ' + C + ' d="M24 28 L32 38 M32 28 L24 38"/><circle ' + C + ' cx="50" cy="33" r="4"/>',
      pupil: '<circle ' + F + ' cx="32" cy="16" r="7"/><path ' + C + ' d="M22 40 Q32 26 42 40"/><circle ' + C + ' cx="12" cy="40" r="4"/><circle ' + C + ' cx="52" cy="40" r="4"/><circle ' + C + ' cx="22" cy="52" r="4"/><circle ' + C + ' cx="42" cy="52" r="4"/>',
      bell: '<path ' + F + ' d="M16 44 Q16 18 32 16 Q48 18 48 44 Z"/><path ' + C + ' d="M12 44 H52 M32 10 V16"/><path ' + C + ' d="M8 22 Q4 32 8 42 M56 22 Q60 32 56 42"/><circle ' + C + ' cx="32" cy="50" r="3"/>',
      pair: '<circle ' + F + ' cx="26" cy="12" r="5"/><path ' + C + ' d="M26 18 V34 M18 28 L34 24"/><circle ' + F + ' cx="32" cy="34" r="6"/><path ' + C + ' d="M32 40 V52 M26 58 L32 52 L38 58 M24 44 H40"/><path ' + C + ' d="M44 30 L52 26"/>'
    };
    var cards = [
      ["rams", "Contact", "phassa", "Two rams butting heads: one is the eye, one is the visible object, and their meeting is contact. Or two hands clapping.", "Milindapañha <a class='xr' href='#p4'>→ 4</a> <a class='xr' href='#p9'>→ 9</a>"],
      ["crown", "Feeling", "vedanā", "A cook tastes a dish while preparing it; the king enjoys the whole meal. Other factors touch the object's taste in passing. Feeling, as master, enjoys it fully.", "Atthasālinī <a class='xr' href='#p3'>→ 3</a> <a class='xr' href='#p9'>→ 9</a>"],
      ["mark", "Perception", "saññā", "A carpenter marks his timber so he can recognise it later. Perception makes a sign, so that next time it can say, “this is the same”.", "Visuddhimagga XIV <a class='xr' href='#p4'>→ 4</a>"],
      ["pupil", "Volition", "cetanā", "A head pupil recites his own lesson and makes the others recite theirs. Volition does its own work and sets the other factors to theirs.", "Atthasālinī <a class='xr' href='#p4'>→ 4</a> <a class='xr' href='#p10'>→ 10</a>"],
      ["bell", "Applied and sustained thought", "vitakka, vicāra", "Striking a bell, and its ringing on. A bird spreading its wings to take off, and gliding. A bee diving onto a lotus, and moving over it once landed.", "Visuddhimagga IV; Milindapañha has a gong <a class='xr' href='#p12'>→ 12</a>"],
      ["pair", "Mind and matter", "nāma-rūpa", "A blind man carrying a lame man who can see: neither can travel alone. Also a puppet that moves only through wood and strings, and two sheaves of reeds propped against each other.", "Visuddhimagga XVIII <a class='xr' href='#p5'>→ 5</a> <a class='xr' href='#p13'>→ 13</a>"]
    ];
    $("similes").innerHTML = cards.map(function (c) {
      return '<div class="sim"><svg viewBox="0 0 64 64" aria-hidden="true">' + icons[c[0]] + '</svg><div><h3>' + c[1] + ' <span class="p">' + c[2] + '</span></h3><p>' + c[3] + '</p><p class="src">' + c[4] + "</p></div></div>";
    }).join("");

    var s = "";
    var who = [["A child", "sees shapes and colours", "saññā · perception", 0], ["A villager", "knows: money, can be spent", "viññāṇa · consciousness", 1], ["A money-changer", "knows: genuine or false", "paññā · understanding", 2]];
    who.forEach(function (w, i) {
      var x = 10 + i * 220;
      var depth = i + 1;
      for (var c = 0; c < 3; c++) s += T("ellipse", { cx: x + 26 + c * 14, cy: 112 - c * 3, rx: 12, ry: 5, style: "fill:var(--rupa-soft);stroke:var(--rupa);stroke-width:1.4" });
      s += T("circle", { cx: x + 40, cy: 40, r: 11 + i * 2, style: "fill:var(--sheet);stroke:var(--nama);stroke-width:2" });
      s += T("path", { d: "M" + (x + 22 - i * 2) + " 92 Q" + (x + 40) + " " + (58 - i * 3) + " " + (x + 58 + i * 2) + " 92", style: "fill:none;stroke:var(--nama);stroke-width:2" });
      for (var d = 0; d < depth; d++) s += T("line", { x1: x + 46 + 6, y1: 44 + d * 0, x2: x + 74 + d * 18, y2: 96 + d * 8, style: "stroke:var(--nama-2);stroke-width:1.2;stroke-dasharray:3 3" });
      s += T("text", { x: x + 96, y: 34, "class": "tx-l tx-d" }, w[0]);
      s += T("text", { x: x + 96, y: 50, "class": "tx-s tx-mu" }, w[1]);
      s += T("text", { x: x + 96, y: 70, "class": "tx-m tx-it tx-nm" }, w[2]);
      if (i < 2) s += T("path", { d: "M" + (x + 200) + " 60 l8 5 l-8 5", style: "fill:none;stroke:var(--muted);stroke-width:1.4" });
    });
    $("coins").innerHTML = s;
  })();

  /* ---------- r2: shared glyphs (the moment strip, the mango) ----------
     ATLAS.glyph.strip(o) returns SVG for the seventeen moments as a strip of cells:
       o.x, o.y      top-left corner           o.cw, o.ch  cell width and height (8, 10)
       o.gap         gap between cells (1.5)    o.pat       keys (default: a very great object at a sense door)
       o.hl          moments to emphasise (1-based); the rest are faded when o.dim is true
       o.obj         draw the object's 17-moment matter bar above the cells
       o.num         print moment numbers under the cells (every one, or o.num = [list])
     Keys: a past life-continuum, bu vibrating/arrest, pa/ma adverting, vi sense consciousness,
     pr process citta, ja javana, ta registration, b life-continuum after. Colours follow Plate 7's legend.
     ATLAS.glyph.mango(x, y, r) draws the mango (matter: turmeric). */
  var STRIP_FILL = {
    a: "fill:var(--faint);stroke:var(--line)", b: "fill:var(--faint);stroke:var(--line)", bh: "fill:var(--faint);stroke:var(--line)",
    bu: "fill:var(--line);stroke:var(--line)", pa: "fill:var(--nama-soft);stroke:var(--nama-2)", ma: "fill:var(--nama-soft);stroke:var(--nama-2)",
    pr: "fill:var(--nama-soft);stroke:var(--nama-2)", vi: "fill:var(--sheet);stroke:var(--nama);stroke-width:1.6",
    ja: "fill:var(--nama);stroke:var(--nama)", ta: "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:2 1.5"
  };
  var VERY_GREAT = "a bu bu pa vi pr pr pr ja ja ja ja ja ja ja ta ta";
  function momentStrip(o) {
    var x = o.x || 0, y = o.y || 0, cw = o.cw || 8, ch = o.ch || 10, gap = o.gap == null ? 1.5 : o.gap;
    var keys = (o.pat || VERY_GREAT).split(" "), hl = o.hl || [], s = "", pitch = cw + gap;
    if (o.obj) {
      s += T("rect", { x: x, y: y, width: f1(17 * pitch - gap), height: Math.max(3, ch * 0.32), rx: 1.5, style: "fill:var(--rupa-mark)" });
      y += Math.max(3, ch * 0.32) + 2;
    }
    keys.forEach(function (k, i) {
      var faded = o.dim && hl.length && hl.indexOf(i + 1) < 0;
      s += T("rect", { x: f1(x + i * pitch + 0.4), y: f1(y + 0.4), width: f1(cw - 0.8), height: f1(ch - 0.8), rx: Math.min(2.5, cw / 4), style: STRIP_FILL[k] + (faded ? ";opacity:.35" : "") });
      if (!o.dim && hl.indexOf(i + 1) >= 0) s += T("rect", { x: f1(x + i * pitch - 1), y: f1(y - 1), width: f1(cw + 2), height: f1(ch + 2), rx: 3, style: "fill:none;stroke:var(--ink);stroke-width:1.2" });
      if (o.num && (o.num === true || o.num.indexOf(i + 1) >= 0)) s += T("text", { x: f1(x + i * pitch + cw / 2), y: f1(y + ch + 8), "text-anchor": "middle", "class": "tx-mu", style: "font-size:6.5px" }, i + 1);
    });
    return s;
  }
  function mangoGlyph(x, y, r) {
    return T("ellipse", { cx: f1(x), cy: f1(y), rx: f1(r * 0.78), ry: f1(r), transform: "rotate(-24 " + f1(x) + " " + f1(y) + ")", style: "fill:var(--rupa-mark);stroke:var(--rupa);stroke-width:" + f1(Math.max(0.8, r / 12)) }) +
      T("path", { d: "M" + f1(x + r * 0.28) + " " + f1(y - r * 0.98) + " q" + f1(r * 0.5) + " " + f1(-r * 0.36) + " " + f1(r * 0.86) + " " + f1(-r * 0.07) + " q" + f1(-r * 0.43) + " " + f1(r * 0.36) + " " + f1(-r * 0.86) + " " + f1(r * 0.07), style: "fill:var(--nib-soft);stroke:var(--muted);stroke-width:.8" });
  }
  window.ATLAS.glyph = { strip: momentStrip, mango: mangoGlyph, veryGreat: VERY_GREAT };

  /* ---------- plate 7: the mango and the moment, as one aligned timeline ----------
     Rows share the seventeen time columns: the object's matter, the door and the base, the cittas
     (with their Plate 3 numbers), what each moment does (result, functional, new kamma), mind-born
     matter, and the Atthasālinī's mango simile. On screen, choose an object's strength to redraw it.
     Below 560 px the same drawing runs downwards (svg#p7-tlv). */
  (function () {
    var svgH = $("p7-tl"), svgV = $("p7-tlv"); if (!svgH) return;
    var D = window.ATLAS, M = D.mango, CN = {}; D.cittas.forEach(function (c) { CN[c[0]] = c; });
    var KIND = { a: "res", bu: "res", b: "res", pa: "fn", ma: "fn", vi: "res", pr: "res", ja: "kam", ta: "res" };
    var MODES = {
      vg: { t: "Very great", pat: VERY_GREAT + " b", cap: "A very great object: the full seventeen moments, with registration. This is the mango simile." },
      g: { t: "Great", pat: "a a a bu bu pa vi pr pr pr ja ja ja ja ja ja ja b", cap: "A great object strikes when 2–3 moments of the object's life have already passed, so there is no time for registration." },
      s: { t: "Slight", pat: "a a a a a bu bu pa vi pr pr pr pr pr b b b b", cap: "A slight object: no javana. Determining repeats two or three times and the process lapses. No kamma is made." },
      vs: { t: "Very slight", pat: "a a a a a a a a a a a a bu bu b b b b", cap: "A very slight object: the life-continuum only vibrates. No process arises at all." },
      md: { t: "Mind door", pat: "bu bu ma ja ja ja ja ja ja ja ta ta b b b b b b", cap: "At the mind door no matter needs to strike: the object appears to the vibrating life-continuum, then mind-door adverting, seven javanas and registration (Plate 3b)." }
    };
    var mode = "vg";
    /* the Plate 3 citta that does each job in this example; determining that repeats is #29 again */
    function cittaOf(k, nPr) { return { a: 39, bu: 39, b: 39, pa: 28, ma: 29, vi: 20, ja: 3, ta: 26, pr: [25, 26, 29, 29, 29][nPr] }[k]; }
    function jobOf(k, nPr) { return { a: "life-cont.", bu: "life-cont.", b: "life-cont.", pa: "adverting", ma: "adverting", vi: "seeing", ja: "javana", ta: "registration", pr: ["receiving", "investigating", "determining", "determining", "determining"][nPr] }[k]; }
    function cells() {
      var keys = MODES[mode].pat.split(" "), n = 0;
      return keys.map(function (k, i) { var c = { k: k, i: i, c: cittaOf(k, n), job: jobOf(k, n) }; if (k === "pr") n++; return c; });
    }

    /* tiny line drawings for the simile, each in a box of about 26 × 22 */
    var INK = "fill:none;stroke:var(--ink);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round";
    var MU = "fill:none;stroke:var(--muted);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round";
    function icon(kind, x, y, later) {
      var st = later ? MU + ";stroke-dasharray:2 1.5" : INK, g = "";
      function P(d) { g += T("path", { d: d, style: st, transform: "translate(" + f1(x) + "," + f1(y) + ")" }); }
      if (kind === "sleep") {
        P("M30 22 V8 M30 8 m-11 0 a11 7 0 1 0 22 0 a11 7 0 1 0 -22 0"); P("M2 22 H44 M6 20 h18 M4 17 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0");
        P("M2 15 l9 -2 l1 4"); g += mangoGlyph(x + 46, y + 13, 3.4); P("M48 6 l-2 3 M52 8 l-2 3");
      } else if (kind === "wake") { P("M6 10 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M11 15 V22 M3 6 q6 -6 14 -1"); P("M19 8 q3 2 0 4 M22 6 q5 4 0 8"); }
      else if (kind === "see") { P("M2 11 q10 -9 20 0 q-10 9 -20 0 Z"); g += T("circle", { cx: f1(x + 12), cy: f1(y + 11), r: 2.6, style: "fill:var(--ink)" }); }
      else if (kind === "take") { P("M3 20 V12 M3 12 q0 -3 3 -3 h7 M8 9 V6 M11 9 V5 M14 9 V6 M13 12 h4"); g += mangoGlyph(x + 20, y + 9, 4); }
      else if (kind === "squeeze") { g += mangoGlyph(x + 12, y + 12, 5); P("M4 6 q3 6 0 12 M20 6 q-3 6 0 12 M1 12 h2 M21 12 h2"); }
      else if (kind === "smell") { P("M5 3 q4 8 0 12 q3 2 5 0"); g += mangoGlyph(x + 21, y + 12, 4.5); P("M11 9 q2 -2 4 0 M11 13 q2 -2 4 0"); }
      else if (kind === "eat") { P("M2 9 q12 10 24 0 M2 9 q12 4 24 0"); g += mangoGlyph(x + 34, y + 9, 5); P("M37 4 a2.4 2.4 0 0 0 2 3"); }
      else if (kind === "swallow") { P("M6 2 q6 4 6 10 V22 M12 12 l-3 5 M12 12 l3 5"); }
      else if (kind === "lie") { P("M2 20 H26 M4 16 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M10 17 h14 M16 6 q3 -2 5 0 M20 2 q2 -1 3 0"); }
      return g;
    }
    var SIM = [["sleep", 1, 3], ["wake", 4, 4], ["see", 5, 5], ["take", 6, 6], ["squeeze", 7, 7], ["smell", 8, 8], ["eat", 9, 15], ["swallow", 16, 17], ["lie", 18, 18]];
    var SIMT = { sleep: ["asleep under the tree;", "a mango falls"], wake: ["wakes,", "turns"], see: ["sees", "it"], take: ["takes", "it"], squeeze: ["squeezes", "it"], smell: ["smells", "it"], eat: ["eats it: the wanting", "is here, and kamma is made"], swallow: ["swallows †"], lie: ["sleeps †"] };

    /* ----- horizontal: 18 columns ----- */
    function drawH() {
      var X0 = 76, P = 33, W = 29, cs = cells(), s = "", vg = mode === "vg", md = mode === "md", WALL = 17 * P - (P - W);
      function cx(i) { return X0 + i * P + W / 2; }
      function L(y, a, b) { s += T("text", { x: 0, y: y, "class": "tx-s tx-b" }, a); if (b) s += T("text", { x: 0, y: y + 10, "class": "tx-xs tx-mu" }, b); }
      /* moment numbers */
      cs.forEach(function (c, i) { s += T("text", { x: cx(i), y: 9, "text-anchor": "middle", "class": "tx-xs tx-mu" }, i < 17 ? i + 1 : "then"); });
      /* object */
      L(24, "Object", md ? "any kind" : "Plate 5");
      if (md) {
        s += T("rect", { x: X0, y: 15, width: WALL, height: 14, rx: 3, style: "fill:none;stroke:var(--line);stroke-dasharray:3 2" });
        s += T("text", { x: X0 + 8, y: 25, "class": "tx-xs tx-mu" }, "a mental object: no matter has to strike the door, so the process is not tied to seventeen moments");
      } else {
        s += T("rect", { x: X0, y: 15, width: WALL, height: 14, rx: 3, style: "fill:var(--rupa-soft);stroke:var(--rupa-mark)" });
        s += T("rect", { x: X0, y: 15, width: 3, height: 14, style: "fill:var(--rupa-mark)" }) + T("rect", { x: X0 + WALL - 3, y: 15, width: 3, height: 14, style: "fill:var(--rupa-mark)" });
        s += mangoGlyph(X0 + 13, 22, 4.6);
        s += T("text", { x: X0 + 24, y: 25.5, "class": "tx-xs tx-rp tx-b" }, "the mango's colour: one unit of matter, alive for 17 mind-moments (51 sub-moments); it strikes the eye as it arises");
      }
      /* door */
      L(45, "Door");
      if (md) s += T("rect", { x: X0, y: 39, width: 2 * P - (P - W), height: 8, rx: 2, style: "fill:var(--line)" }) + T("text", { x: X0 + 2 * P + 4, y: 46, "class": "tx-xs tx-mu" }, "the mind door is the life-continuum itself");
      else {
        s += T("rect", { x: X0, y: 39, width: WALL, height: 8, rx: 2, style: "fill:color-mix(in srgb, var(--rupa-mark) 40%, transparent)" });
        s += T("text", { x: X0 + WALL / 2, y: 45.8, "text-anchor": "middle", "class": "tx-xs", style: "font-size:7.5px" }, "the eye-door: eye-sensitivity, kamma-born matter, through which the whole process takes its object");
      }
      /* base */
      L(63, "Base", "heart; eye at 5");
      cs.forEach(function (c, i) {
        var eye = c.k === "vi";
        s += T("rect", { x: cx(i) - 4, y: 55, width: 8, height: 8, rx: 1.5, style: eye ? "fill:var(--rupa-mark)" : "fill:none;stroke:var(--rupa-mark);stroke-width:1.1" });
        s += T("title", {}, eye ? "Eye-consciousness depends on the eye as its base." : "Every other citta here depends on the heart-base.");
      });
      /* cittas */
      L(92, "Citta", "Plate 3 no.");
      cs.forEach(function (c, i) {
        var ttl = "#" + c.c + " " + CN[c.c][1] + (c.c === 39 ? " (illustrative: this man's life-continuum; any of #27, #39–46 for a human)" : "");
        var lab = "#" + c.c;
        s += T("a", { href: "#p3", "aria-label": ttl }, T("rect", { x: X0 + i * P, y: 76, width: W, height: 26, rx: 4, style: STRIP_FILL[c.k] }) +
          (lab ? T("text", { x: cx(i), y: 93, "text-anchor": "middle", "class": (c.c === 39 ? "tx-xs tx-mu" : "tx-s tx-b") + (c.k === "ja" ? " tx-onac" : "") }, lab) : "") + T("title", {}, ttl));
      });
      /* job names: runs get a bracket; single cells alternate between two lines so they never collide */
      var runs = [], cur = null;
      cs.forEach(function (c, i) { if (cur && cur.job === c.job && (c.k === "ja" || c.k === "ta" || c.job === "life-cont." || c.job === "determining")) cur.b = i; else { cur = { job: c.job, a: i, b: i }; runs.push(cur); } });
      var alt = 0;
      runs.forEach(function (r) {
        var mid = (cx(r.a) + cx(r.b)) / 2, wide = r.b > r.a, y = wide ? 114 : (alt++ % 2 ? 123 : 114);
        if (wide) s += T("path", { d: "M" + (X0 + r.a * P + 2) + " 105 v2 H" + (X0 + r.b * P + W - 2) + " v-2", style: "fill:none;stroke:var(--muted);stroke-width:.8" });
        var n = r.b - r.a + 1, txt = r.job === "javana" ? "javana ×" + n : (r.job === "life-cont." ? "life-continuum" : (wide ? r.job + " ×" + n : r.job));
        s += T("text", { x: mid, y: y, "text-anchor": "middle", "class": "tx-xs" + (r.job === "javana" ? " tx-b" : ""), style: "font-size:7.8px" }, txt);
      });
      /* what the moment does */
      L(141, "Does", "result · act · kamma");
      cs.forEach(function (c, i) {
        var k = KIND[c.k], x = cx(i), y = 139;
        if (k === "res") s += T("circle", { cx: x, cy: y, r: 3.2, style: "fill:none;stroke:var(--nama-2);stroke-width:1.2" });
        else if (k === "fn") s += T("rect", { x: x - 3, y: y - 3, width: 6, height: 6, style: "fill:none;stroke:var(--muted);stroke-width:1.2" });
        else s += T("path", { d: "M" + x + " " + (y - 5) + " l4.5 5 l-4.5 5 l-4.5 -5 Z", style: "fill:var(--kamma)" });
      });
      var ja = cs.filter(function (c) { return c.k === "ja"; });
      if (ja.length) s += T("text", { x: (cx(ja[0].i) + cx(ja[ja.length - 1].i)) / 2, y: 153, "text-anchor": "middle", "class": "tx-xs tx-b", style: "fill:var(--kamma)" }, "new kamma: greed-rooted volition (Plate 10)");
      /* mind-born matter */
      L(169, "Body", "mind-born matter");
      cs.forEach(function (c, i) {
        if (c.k === "vi") { s += T("text", { x: cx(i), y: 169, "text-anchor": "middle", "class": "tx-xs tx-mu", style: "font-size:7px" }, "none"); return; }
        var big = c.k === "ja";
        s += T("rect", { x: cx(i) - (big ? 3.5 : 2.5), y: 163 - (big ? 1 : 0), width: big ? 7 : 5, height: big ? 7 : 5, rx: 1, style: "fill:var(--rupa-mark)" + (big ? "" : ";opacity:.7") });
      });
      if (ja.length) s += T("text", { x: (cx(ja[0].i) + cx(ja[ja.length - 1].i)) / 2, y: 180, "text-anchor": "middle", "class": "tx-xs tx-rp", style: "font-size:7.5px" }, "javanas can also move the body: a hand reaching out (Plate 5)");
      /* the simile */
      L(206, "Simile", vg ? "Atthasālinī" : "very great only");
      SIM.forEach(function (sm, j) {
        var a = sm[1] - 1, b = sm[2] - 1, mid = (cx(a) + cx(b)) / 2, later = j >= 7, w = sm[0] === "sleep" ? 54 : (sm[0] === "eat" ? 42 : 26);
        var g = icon(sm[0], mid - w / 2, 189, later);
        SIMT[sm[0]].forEach(function (ln, k) {
          g += T("text", { x: mid, y: 220 + k * 9, "text-anchor": "middle", "class": "tx-xs" + (later ? " tx-mu" : ""), style: "font-size:7.6px" }, ln);
        });
        s += T("g", { style: vg ? "" : "opacity:.25" }, g);
        if (b > a) s += T("path", { d: "M" + (X0 + a * P + 2) + " 187 v-2 H" + (X0 + b * P + W - 2) + " v2", style: "fill:none;stroke:var(--line);stroke-width:.8" });
      });
      svgH.innerHTML = s;
    }

    /* ----- vertical: one row per moment ----- */
    function drawV() {
      var R = 30, Y0 = 26, cs = cells(), s = "", vg = mode === "vg", md = mode === "md";
      function cy(i) { return Y0 + i * R + R / 2; }
      [["#", 10], ["obj.", 30], ["base", 54], ["citta · job", 112], ["does", 178], ["simile", 266]].forEach(function (h) { s += T("text", { x: h[1], y: 12, "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, h[0]); });
      if (!md) s += T("rect", { x: 25, y: Y0 + 2, width: 10, height: 17 * R - 4, rx: 3, style: "fill:var(--rupa-soft);stroke:var(--rupa-mark)" });
      cs.forEach(function (c, i) {
        var y = cy(i), k = KIND[c.k];
        s += T("text", { x: 10, y: y + 3, "text-anchor": "middle", "class": "tx-xs tx-mu" }, i < 17 ? i + 1 : "→");
        s += T("rect", { x: 48, y: y - 4, width: 8, height: 8, rx: 1.5, style: c.k === "vi" ? "fill:var(--rupa-mark)" : "fill:none;stroke:var(--rupa-mark);stroke-width:1.1" });
        s += T("rect", { x: 66, y: y - 12, width: 92, height: 24, rx: 4, style: STRIP_FILL[c.k] });
        var lab = "#" + c.c + " " + (c.job === "life-cont." ? "life-continuum" : c.job);
        s += T("text", { x: 72, y: y + 3.5, "class": "tx-s" + (c.k === "ja" ? " tx-onac tx-b" : "") }, lab);
        if (k === "res") s += T("circle", { cx: 172, cy: y, r: 3.4, style: "fill:none;stroke:var(--nama-2);stroke-width:1.2" });
        else if (k === "fn") s += T("rect", { x: 169, y: y - 3, width: 6, height: 6, style: "fill:none;stroke:var(--muted);stroke-width:1.2" });
        else s += T("path", { d: "M172 " + (y - 5) + " l4.5 5 l-4.5 5 l-4.5 -5 Z", style: "fill:var(--kamma)" });
        if (c.k !== "vi") s += T("rect", { x: 184, y: y - 2.5, width: 5, height: 5, rx: 1, style: "fill:var(--rupa-mark)" });
      });
      SIM.forEach(function (sm, j) {
        var a = sm[1] - 1, b = sm[2] - 1, y = (cy(a) + cy(b)) / 2, later = j >= 7;
        var txt = M.m.filter(function (m) { return m[0] >= sm[1] && m[1] <= sm[2]; }).map(function (m) { return m[7]; }).join(" ");
        var g = icon(sm[0], 198, y - 11, later);
        var words = txt.split(" "), lines = [], cur = "";
        var lim = sm[0] === "sleep" || sm[0] === "eat" ? 17 : 22;
        words.forEach(function (w) { if ((cur + " " + w).trim().length > lim) { lines.push(cur.trim()); cur = w; } else cur += " " + w; });
        lines.push(cur.trim());
        var tx = sm[0] === "sleep" || sm[0] === "eat" ? 258 : 230;
        lines.slice(0, b > a ? 8 : 3).forEach(function (ln, k) { g += T("text", { x: tx, y: y - (lines.length - 1) * 5 + 3 + k * 10, "class": "tx-xs" + (later ? " tx-mu" : ""), style: "font-size:8.4px" }, ln); });
        if (b > a) g += T("path", { d: "M196 " + (cy(a) - 10) + " h-3 V" + (cy(b) + 10) + " h3", style: "fill:none;stroke:var(--line)" });
        s += T("g", { style: vg ? "" : "opacity:.25" }, g);
      });
      svgV.setAttribute("viewBox", "0 0 340 " + (Y0 + cs.length * R + 4));
      svgV.innerHTML = s;
    }

    var info = $("p7-info");
    function render() {
      drawH(); if (svgV) drawV();
      if (info) info.textContent = MODES[mode].cap;
      var bar = $("p7-modes");
      if (bar) Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-m") === mode)); });
    }
    var bar = $("p7-modes");
    if (bar) {
      bar.innerHTML = '<span class="lab">Object</span>' + Object.keys(MODES).map(function (k) { return '<button type="button" class="pill" data-m="' + k + '">' + MODES[k].t + "</button>"; }).join("");
      bar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; mode = b.getAttribute("data-m"); render(); });
    }
    render();

    /* the five strengths, drawn with the shared strip */
    var strips = [
      ["Very great object: complete, with registration", "a bu bu pa vi pr pr pr ja ja ja ja ja ja ja ta ta"],
      ["Great: 2–3 past moments, no registration", "a a a bu bu pa vi pr pr pr ja ja ja ja ja ja ja"],
      ["Slight: no javana; determining repeats", "a a a a a bu bu pa vi pr pr pr pr pr b b b"],
      ["Very slight: the life-continuum only vibrates", "a a a a a a a a a a a a bu bu b b b"],
      ["Mind door, clear object", "bu bu ma ja ja ja ja ja ja ja ta ta"]
    ];
    var s = "";
    strips.forEach(function (st, i) {
      var y = i * 41;
      s += T("text", { x: 0, y: y + 11, "class": "tx-s" + (i === 4 ? " tx-nm" : "") }, st[0]);
      s += momentStrip({ x: 0, y: y + 17, cw: 16, ch: 16, gap: 3, pat: st[1] });
    });
    $("strengths").innerHTML = s;
  })();

  /* ---------- plate 7: matter ---------- */
  (function () {
    var I8 = "kcua";
    var rows = [
      ["pathavī", "earth", I8], ["āpo", "water", I8], ["tejo", "fire", I8], ["vāyo", "air", I8],
      ["cakkhu", "eye-sensitivity", "k"], ["sota", "ear-sensitivity", "k"], ["ghāna", "nose-sensitivity", "k"], ["jivhā", "tongue-sensitivity", "k"], ["kāya", "body-sensitivity", "k"],
      ["vaṇṇa", "visible form", I8], ["sadda", "sound", "cu"], ["gandha", "smell", I8], ["rasa", "taste", I8],
      ["itthibhāva", "femininity", "k"], ["purisabhāva", "masculinity", "k"], ["hadaya", "heart-base", "k"], ["jīvita", "life faculty", "k"], ["ojā", "nutritive essence", I8],
      ["ākāsa", "space", I8], ["kāya-viññatti", "bodily intimation", "c"], ["vacī-viññatti", "vocal intimation", "c"],
      ["lahutā", "lightness", "cua"], ["mudutā", "malleability", "cua"], ["kammaññatā", "wieldiness", "cua"],
      ["upacaya", "production", ""], ["santati", "continuity", ""], ["jaratā", "decay", ""], ["aniccatā", "impermanence", ""]
    ];
    var cols = [["k", "kamma"], ["c", "mind"], ["u", "temp."], ["a", "food"], ["", "none"]];
    var x0 = 172, cw = 31, y0 = 44, rh = 15.6, s = "";
    cols.forEach(function (c, i) {
      s += T("text", { x: x0 + i * cw + cw / 2, y: 30, "text-anchor": "middle", "class": "tx-xs tx-b" + (i === 4 ? " tx-mu" : "") }, c[1]);
    });
    var tot = [0, 0, 0, 0, 0];
    rows.forEach(function (r, i) {
      var y = y0 + i * rh + (i >= 18 ? 8 : 0);
      if (i % 2 === 0) s += T("rect", { x: 22, y: y - 1, width: 308, height: rh, "class": "fl-faint" });
      s += T("text", { x: 26, y: y + 11, "class": "tx-m tx-it" }, r[0]);
      s += T("text", { x: 104, y: y + 11, "class": "tx-xs tx-mu" }, r[1]);
      cols.forEach(function (c, j) {
        var on = c[0] === "" ? r[2] === "" : r[2].indexOf(c[0]) >= 0;
        var cx = x0 + j * cw + cw / 2;
        if (on) { tot[j]++; s += T("rect", { x: cx - 5.5, y: y + 2, width: 11, height: 11, rx: 2, style: "fill:" + (j === 4 ? "var(--muted)" : "var(--rupa-mark)") }); }
        else s += T("circle", { cx: cx, cy: y + 7.5, r: 1.3, "class": "fl-line" });
      });
    });
    var ty = y0 + rows.length * rh + 22;
    s += T("line", { x1: 22, y1: ty - 14, x2: 330, y2: ty - 14, "class": "st-ink" });
    s += T("text", { x: 26, y: ty, "class": "tx-s tx-b" }, "kinds produced");
    tot.forEach(function (t, j) { s += T("text", { x: x0 + j * cw + cw / 2, y: ty, "text-anchor": "middle", "class": "tx-l tx-b tx-d" }, t); });
    var b1 = y0 - 1, b2 = y0 + 18 * rh - 2, b3 = y0 + 18 * rh + 7, b4 = y0 + 28 * rh + 7;
    s += T("path", { d: "M16 " + b1 + " H11 V" + b2 + " H16", fill: "none", "class": "st-mu" });
    s += T("path", { d: "M16 " + b3 + " H11 V" + b4 + " H16", fill: "none", "class": "st-mu" });
    s += T("text", { x: 11, y: (b1 + b2) / 2, transform: "rotate(-90 11 " + (b1 + b2) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "CONCRETE 18");
    s += T("text", { x: 11, y: (b3 + b4) / 2, transform: "rotate(-90 11 " + (b3 + b4) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "NON-CONCRETE 10");
    $("rupa-matrix").innerHTML = s;

    var m = "", sw = 6.2, x = 8;
    for (var i = 0; i < 17; i++) {
      m += T("rect", { x: f1(x + i * 3 * sw), y: 14, width: f1(3 * sw - 1.2), height: 18, rx: 2, style: "fill:var(--nama-soft);stroke:var(--nama-2)" });
    }
    m += T("text", { x: x, y: 10, "class": "tx-xs tx-nm tx-b" }, "17 CITTAS × 3 SUB-MOMENTS");
    m += T("rect", { x: x, y: 44, width: f1(sw - .6), height: 22, style: "fill:var(--rupa)" });
    m += T("rect", { x: f1(x + sw), y: 44, width: f1(49 * sw - .6), height: 22, style: "fill:var(--rupa-soft);stroke:var(--rupa-mark)" });
    m += T("rect", { x: f1(x + 50 * sw), y: 44, width: f1(sw - .6), height: 22, style: "fill:var(--rupa)" });
    m += T("text", { x: f1(x + 25.5 * sw), y: 59, "text-anchor": "middle", "class": "tx-s tx-rp tx-b" }, "presence · 49 sub-moments");
    m += T("text", { x: x, y: 82, "class": "tx-xs tx-mu" }, "↑ arising: 1");
    m += T("text", { x: f1(x + 51 * sw), y: 82, "text-anchor": "end", "class": "tx-xs tx-mu" }, "dissolution: 1 ↑");
    m += T("text", { x: x, y: 104, "class": "tx-s tx-mu" }, "Matter is slow to change, so many minds pass over one body.");
    $("matter-life").innerHTML = m;

    var groups = [
      ["Kamma-born", [["eye-decad", ["life", "eye"]], ["ear-decad", ["life", "ear"]], ["nose-decad", ["life", "nose"]], ["tongue-decad", ["life", "tongue"]], ["body-decad", ["life", "body"]], ["female-decad", ["life", "fem."]], ["male-decad", ["life", "masc."]], ["heart-base decad", ["life", "heart"]], ["vital nonad", ["life"]]]],
      ["Mind-born", [["pure octad", []], ["bodily intimation nonad", ["b.int"]], ["vocal intimation decad", ["v.int", "sound"]], ["undecad of mutability", ["m", "m", "m"]], ["bodily int. + mutability", ["b.int", "m", "m", "m"]], ["vocal int. + sound + mut.", ["v.int", "sound", "m", "m", "m"]]]],
      ["Temperature-born", [["pure octad", []], ["sound nonad", ["sound"]], ["undecad of mutability", ["m", "m", "m"]], ["sound + mutability", ["sound", "m", "m", "m"]]]],
      ["Nutriment-born", [["pure octad", []], ["undecad of mutability", ["m", "m", "m"]]]]
    ];
    var k = "", y = 0, sq = 9.5, st2 = 11.2, kx = 146;
    groups.forEach(function (g) {
      y += 13;
      k += T("text", { x: 0, y: y, "class": "tx-s tx-b tx-rp" }, g[0] + " · " + g[1].length);
      y += 3;
      g[1].forEach(function (r) {
        k += T("text", { x: 6, y: y + 9, "class": "tx-xs" }, r[0]);
        for (var i = 0; i < 8; i++) k += T("rect", { x: f1(kx + i * st2), y: y + 1, width: sq, height: sq, rx: 1.5, style: "fill:var(--rupa-soft);stroke:var(--rupa);stroke-width:.8" });
        r[1].forEach(function (a, j) {
          k += T("rect", { x: f1(kx + (8 + j) * st2 + 3), y: y + 1, width: sq, height: sq, rx: 1.5, style: "fill:var(--rupa-mark)" });
        });
        if (r[1].length && r[1].length <= 2) k += T("text", { x: f1(kx + (8 + r[1].length) * st2 + 8), y: y + 9, "class": "tx-xs tx-mu" }, "+ " + r[1].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (v) { return v === "m" ? "3 mutable" : v; }).join(", "));
        y += 13;
      });
    });
    $("kalapas").setAttribute("viewBox", "0 0 330 " + (y + 4));
    $("kalapas").innerHTML = k;
  })();

  /* ---------- plate 8: conditions ---------- */
  (function () {
    var C24 = [[1, "hetu", "root", "B"], [2, "ārammaṇa", "object", "E"], [3, "adhipati", "predominance", "F"], [4, "anantara", "proximity", "A"], [5, "samanantara", "contiguity", "A"], [6, "sahajāta", "conascence", "F"],
      [7, "aññamañña", "mutuality", "F"], [8, "nissaya", "support", "F"], [9, "upanissaya", "decisive support", "E"], [10, "purejāta", "prenascence", "D"], [11, "pacchājāta", "postnascence", "C"], [12, "āsevana", "repetition", "A"],
      [13, "kamma", "kamma", "B"], [14, "vipāka", "result", "B"], [15, "āhāra", "nutriment", "F"], [16, "indriya", "faculty", "F"], [17, "jhāna", "jhāna", "B"], [18, "magga", "path", "B"],
      [19, "sampayutta", "association", "A"], [20, "vippayutta", "dissociation", "F"], [21, "atthi", "presence", "F"], [22, "natthi", "absence", "A"], [23, "vigata", "disappearance", "A"], [24, "avigata", "non-disappearance", "F"]];
    var G = {
      A: ["var(--nama)", "Mind → mind", "N", "N", "Each citta, as it ceases, gives way to the next: the stream has no gaps. Javanas strengthen their successors."],
      B: ["var(--nama-2)", "Mind → mind & matter", "N", "NR", "Roots, jhāna and path factors steady the citta, its factors and the matter it produces. Volition is kamma."],
      C: ["var(--rupa)", "Mind → matter", "N", "R", "Later cittas sustain the body that arose before them. This is postnascence."],
      D: ["var(--rupa-mark)", "Matter → mind", "R", "N", "The eye, already arisen, supports the eye-consciousness that follows; so does a visible object already present."],
      E: ["var(--muted)", "Anything → mind", "CNR", "N", "Concepts, mind or matter can all be objects. A strong past experience, a teacher, a habit can decisively support what arises now."],
      F: ["var(--ink)", "Mind & matter → both", "NR", "NR", "Mostly things arising together, like a tripod's legs; some work from an earlier base or a later citta."]
    };
    function nodes(spec, x) {
      var out = "", parts = spec.split(""), n = parts.length, y0 = 20 - (n - 1) * 7;
      parts.forEach(function (p, i) {
        var y = y0 + i * 14;
        if (p === "N") out += T("circle", { cx: x, cy: y, r: 6.5, style: "fill:var(--nama)" });
        else if (p === "R") out += T("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 1.5, style: "fill:var(--rupa-mark)" });
        else out += T("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 6, style: "fill:none;stroke:var(--muted);stroke-dasharray:2 2" });
      });
      return out;
    }
    $("rels").innerHTML = Object.keys(G).map(function (key) {
      var g = G[key], list = C24.filter(function (c) { return c[3] === key; });
      var svg = '<svg viewBox="0 0 150 40" aria-hidden="true">' + nodes(g[2], 20) +
        T("line", { x1: 34, y1: 20, x2: 112, y2: 20, style: "stroke:" + g[0] + ";stroke-width:2" }) +
        T("path", { d: "M106 15 L114 20 L106 25", style: "fill:none;stroke:" + g[0] + ";stroke-width:2" }) + nodes(g[3], 130) + "</svg>";
      return '<div class="rel"><div class="top"><h3>' + g[1] + '</h3><span class="n" style="color:' + g[0] + '">' + list.length + "</span></div>" + svg +
        '<div class="chips">' + list.map(function (c) { return '<span class="chip" style="background:' + g[0] + '">' + c[0] + " " + c[2] + "</span>"; }).join("") + "</div><p>" + g[4] + "</p></div>";
    }).join("");
    $("cond24").innerHTML = C24.map(function (c) {
      return '<div style="background:' + G[c[3]][0] + '"><b>' + c[0] + "</b><i>" + c[1] + "</i><span>" + c[2] + "</span></div>";
    }).join("");
    var ex = [
      ["The eye-base, already present, supports eye-consciousness", [[10, "D"], [8, "F"], [21, "F"]]],
      ["The mango's colour is the object of eye-consciousness", [[2, "E"], [10, "D"]]],
      ["Five-door adverting gives way to eye-consciousness", [[4, "A"], [5, "A"], [22, "A"], [23, "A"]]],
      ["Greed, a root, steadies the javana and its factors", [[1, "B"], [6, "F"]]],
      ["Each javana strengthens the next", [[12, "A"]]],
      ["Contact, feeling and the rest arise together and support each other", [[6, "F"], [7, "F"], [19, "A"]]],
      ["Volition in the javanas can ripen in a later life", [[13, "B"]]]
    ];
    $("example").innerHTML = ex.map(function (e) {
      return "<div>" + e[0] + '</div><div class="cs">' + e[1].map(function (c) { var d = C24[c[0] - 1]; return '<span class="chip" style="background:' + G[c[1]][0] + '">' + d[0] + " " + d[2] + "</span>"; }).join("") + "</div>";
    }).join("");
  })();

  /* ---------- plate 9: wheel ---------- */
  (function () {
    var cx = 340, cy = 300, s = "";
    var L = [[1, "avijjā", "ignorance", "D"], [2, "saṅkhārā", "formations", "K"], [3, "viññāṇa", "consciousness", "R"], [4, "nāmarūpa", "mind and matter", "R"], [5, "saḷāyatana", "six sense bases", "R"], [6, "phassa", "contact", "R"],
      [7, "vedanā", "feeling", "R"], [8, "taṇhā", "craving", "D"], [9, "upādāna", "clinging", "D"], [10, "bhava", "becoming", "KR"], [11, "jāti", "birth", "R"], [12, "jarāmaraṇa", "decay and death", "R"]];
    var RC = { D: "var(--bad)", K: "var(--kamma)", R: "var(--nama-2)" };
    function arc(r0, r1, a0, a1) {
      var p = function (r, a) { return f1(cx + r * Math.cos(rad(a))) + " " + f1(cy + r * Math.sin(rad(a))); };
      var large = (a1 - a0) > 180 ? 1 : 0;
      return "M" + p(r1, a0) + " A" + r1 + " " + r1 + " 0 " + large + " 1 " + p(r1, a1) + " L" + p(r0, a1) + " A" + r0 + " " + r0 + " 0 " + large + " 0 " + p(r0, a0) + " Z";
    }
    var periods = [["past", -90, -30, "var(--muted)"], ["present", -30, 210, "var(--ink)"], ["future", 210, 270, "color-mix(in srgb, var(--muted) 55%, var(--sheet))"]];
    periods.forEach(function (p) {
      s += T("path", { d: arc(246, 262, p[1] + .6, p[2] - .6), style: "fill:" + p[3] });
      var mid = (p[1] + p[2]) / 2, r = 254;
      var tx = cx + r * Math.cos(rad(mid)), ty = cy + r * Math.sin(rad(mid));
      var rot = mid + 90; while (rot > 90) rot -= 180; while (rot <= -90) rot += 180;
      s += T("text", { x: f1(tx), y: f1(ty), transform: "rotate(" + f1(rot) + " " + f1(tx) + " " + f1(ty) + ")", "text-anchor": "middle", "dominant-baseline": "central", "class": "tx-xs tx-b tx-onac", style: "letter-spacing:.08em" }, p[0].toUpperCase());
    });
    L.forEach(function (l, i) {
      var a0 = -90 + i * 30, a1 = a0 + 30, mid = a0 + 15;
      s += T("path", { d: arc(150, 242, a0 + .8, a1 - .8), style: "fill:var(--faint);stroke:" + (l[0] === 1 || l[0] === 8 ? "var(--ink);stroke-width:2.5" : "var(--line)") });
      if (l[3] === "KR") {
        s += T("path", { d: arc(128, 146, a0 + .8, mid), style: "fill:" + RC.K });
        s += T("path", { d: arc(128, 146, mid, a1 - .8), style: "fill:" + RC.R });
      } else s += T("path", { d: arc(128, 146, a0 + .8, a1 - .8), style: "fill:" + RC[l[3]] });
      var r = 196, tx = cx + r * Math.cos(rad(mid)), ty = cy + r * Math.sin(rad(mid));
      s += T("text", { x: f1(tx), y: f1(ty - 14), "text-anchor": "middle", "class": "tx-s tx-mu tx-b" }, l[0]);
      s += T("text", { x: f1(tx), y: f1(ty + 2), "text-anchor": "middle", "class": "tx-l tx-it" }, l[1]);
      s += T("text", { x: f1(tx), y: f1(ty + 16), "text-anchor": "middle", "class": "tx-xs tx-mu" }, l[2]);
    });
    [[-30, "1"], [120, "2"], [210, "3"]].forEach(function (c) {
      var r = 254, x = cx + r * Math.cos(rad(c[0])), y = cy + r * Math.sin(rad(c[0]));
      s += T("rect", { x: f1(x - 7), y: f1(y - 7), width: 14, height: 14, transform: "rotate(45 " + f1(x) + " " + f1(y) + ")", style: "fill:var(--sheet);stroke:var(--ink);stroke-width:1.6" });
      s += T("text", { x: f1(x), y: f1(y + 3.5), "text-anchor": "middle", "class": "tx-xs tx-b" }, c[1]);
    });
    var groups = [["past causes", -90, -30], ["present effects", -30, 120], ["present causes", 120, 210], ["future effects", 210, 270]];
    groups.forEach(function (g) {
      var p = function (r, a) { return f1(cx + r * Math.cos(rad(a))) + " " + f1(cy + r * Math.sin(rad(a))); };
      s += T("path", { d: "M" + p(272, g[1] + 2) + " A272 272 0 0 1 " + p(272, g[2] - 2), style: "fill:none;stroke:var(--muted);stroke-width:1.2" });
      var mid = (g[1] + g[2]) / 2, r = 284, c = Math.cos(rad(mid)), sn = Math.sin(rad(mid));
      var x = cx + r * c, y = cy + r * sn + (sn < 0 ? -22 : 8);
      var anc = c < -0.3 ? "end" : (c > 0.3 ? "start" : "middle");
      var words = g[0].split(" ");
      s += T("text", { x: f1(x), y: f1(y), "text-anchor": anc, "class": "tx-s tx-b" }, words[0]);
      s += T("text", { x: f1(x), y: f1(y + 11), "text-anchor": anc, "class": "tx-s tx-b" }, words[1]);
      s += T("text", { x: f1(x), y: f1(y + 22), "text-anchor": anc, "class": "tx-xs tx-mu" }, "5 modes");
    });
    var lines = ["3 periods · 12 factors", "20 modes · 3 connections", "4 groups · 3 rounds", "2 roots"];
    lines.forEach(function (t, i) { s += T("text", { x: cx, y: cy - 30 + i * 19, "text-anchor": "middle", "class": "tx-m" + (i === 3 ? " tx-b" : "") }, t); });
    s += T("text", { x: cx, y: cy + 54, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "ignorance and craving");
    $("wheel").innerHTML = s;

    var modes = [
      ["Past causes", ["ignorance", "formations", "craving", "clinging", "becoming (kamma)"], "var(--muted)"],
      ["Present effects", ["consciousness", "mind and matter", "six sense bases", "contact", "feeling"], "var(--ink)"],
      ["Present causes", ["craving", "clinging", "becoming (kamma)", "ignorance", "formations"], "var(--ink)"],
      ["Future effects", ["consciousness", "mind and matter", "six sense bases", "contact", "feeling"], "var(--muted)"]
    ];
    $("modes").innerHTML = modes.map(function (m) {
      return '<div class="box"><h3 style="color:' + m[2] + '">' + m[0] + "</h3><ol>" + m[1].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div>";
    }).join("") ;
  })();

  /* ---------- plate 10: kamma ---------- */
  (function () {
    var rows = [
      ["By function: what does it do?", [["janaka", "productive: produces rebirth and results during life"], ["upatthambhaka", "supportive: strengthens another kamma's results"], ["upapīḷaka", "obstructive: weakens or delays them"], ["upaghātaka", "destructive: cuts another kamma off and takes its place"]]],
      ["By order: which ripens first at death?", [["garuka", "weighty: jhāna, a heinous crime or fixed wrong view; nothing overrides it"], ["āsanna", "death-proximate: done or recalled just before death"], ["āciṇṇa", "habitual: what one does again and again"], ["kaṭattā", "reserve: anything done once, if nothing else is there"]]],
      ["By time: when does it ripen?", [["diṭṭhadhammavedanīya", "in this very life"], ["upapajjavedanīya", "in the next life"], ["aparāpariyavedanīya", "in any later life"], ["ahosi", "defunct: its chance passed"]]],
      ["By place: where does it ripen?", [["akusala", "unwholesome kamma"], ["kāmāvacara kusala", "sense-sphere wholesome"], ["rūpāvacara kusala", "fine-material wholesome: jhāna"], ["arūpāvacara kusala", "immaterial wholesome"]]]
    ];
    $("kgrid").innerHTML = rows.map(function (r) {
      return '<div class="rh">' + r[0] + "</div>" + r[1].map(function (c) { return '<div class="c"><b>' + c[0] + "</b>" + c[1] + "</div>"; }).join("");
    }).join("");

    var s = "", x0 = 20, w = 40, st = 46;
    for (var i = 0; i < 7; i++) {
      s += T("rect", { x: x0 + i * st, y: 46, width: w, height: 30, rx: 4, style: "fill:var(--nama)" });
      s += T("text", { x: x0 + i * st + w / 2, y: 65, "text-anchor": "middle", "class": "tx-m tx-b tx-onac" }, "J" + (i + 1));
    }
    s += T("text", { x: x0, y: 34, "class": "tx-s tx-mu" }, "one javana series, seven moments");
    var targets = [
      ["this life", "weakest: first javana", 470, "var(--kamma)", [0]],
      ["next life", "seventh javana", 470, "var(--kamma)", [6]],
      ["any later life", "middle five", 470, "color-mix(in srgb, var(--kamma) 60%, var(--sheet))", [1, 2, 3, 4, 5]]
    ];
    targets.forEach(function (t, k) {
      var ty = 6 + k * 38;
      s += T("rect", { x: t[2] - 54, y: ty, width: 108, height: 28, rx: 14, style: "fill:var(--sheet);stroke:" + t[3] + ";stroke-width:1.6" });
      s += T("text", { x: t[2], y: ty + 12, "text-anchor": "middle", "class": "tx-s tx-b" }, t[0]);
      s += T("text", { x: t[2], y: ty + 23, "text-anchor": "middle", "class": "tx-xs tx-mu" }, t[1]);
      t[4].forEach(function (j) {
        var sx = x0 + j * st + w / 2;
        var hy = 90 + k * 7, vx = 372 + k * 12;  /* under the row, then up beside it: never across a box */
        if (ty + 24 >= hy - 10) hy = ty + 14;
        var dd = "M" + sx + " 76 Q" + sx + " " + hy + " " + (sx + 12) + " " + hy + (hy === ty + 14 ? " L" + (t[2] - 56) + " " + hy :
          " L" + (vx - 10) + " " + hy + " Q" + vx + " " + hy + " " + vx + " " + (hy - 10) + " L" + vx + " " + (ty + 24) + " Q" + vx + " " + (ty + 14) + " " + (vx + 10) + " " + (ty + 14) + " L" + (t[2] - 56) + " " + (ty + 14));
        s += T("path", { d: dd, style: "fill:none;stroke:" + t[3] + ";stroke-width:1.3;opacity:.85" });
      });
    });
    $("ripen").innerHTML = s;

    var d = "", cells = [["bh", "bhavaṅga"], ["bh2", "calana"], ["bh2", "upacch."], ["pr", "adverting"], ["ja", "J1"], ["ja", "J2"], ["ja", "J3"], ["ja", "J4"], ["ja", "J5"], ["cu", "death"], ["pa", "rebirth"], ["nb", "bhavaṅga"], ["nb", "bhavaṅga"]];
    var fills = {
      bh: "fill:var(--faint);stroke:var(--line)", bh2: "fill:var(--line);stroke:var(--line)", pr: "fill:var(--nama-soft);stroke:var(--nama-2)", ja: "fill:var(--nama);stroke:var(--nama)",
      cu: "fill:var(--sheet);stroke:var(--ink);stroke-width:2", pa: "fill:var(--nama);stroke:var(--nama)", nb: "fill:var(--nama-soft);stroke:var(--nama-2)"
    };
    var cw = 46, gx = 10;
    cells.forEach(function (c, i) {
      var x = gx + i * cw + (i >= 10 ? 14 : 0);
      d += T("rect", { x: x, y: 50, width: cw - 4, height: 30, rx: 4, style: fills[c[0]] });
      d += T("text", { x: x + (cw - 4) / 2, y: 69, "text-anchor": "middle", "class": "tx-xs " + (c[0] === "ja" || c[0] === "pa" ? "tx-onac tx-b" : ""), style: c[1].length > 6 ? "font-size:7.4px" : null }, c[1]);
    });
    var bx = gx + 10 * cw + 5;
    d += T("line", { x1: bx, y1: 30, x2: bx, y2: 100, "class": "st-ink", "stroke-width": 1.5, "stroke-dasharray": "4 3" });
    d += T("text", { x: bx - 6, y: 38, "text-anchor": "end", "class": "tx-s tx-b" }, "end of one life");
    d += T("text", { x: bx + 6, y: 38, "class": "tx-s tx-b tx-nm" }, "next life");
    d += T("path", { d: "M400 84 Q452 122 505 86", style: "fill:none;stroke:var(--nama);stroke-width:1.6", "marker-end": "url(#arr-nb)" });
    d += T("defs", {}, T("marker", { id: "arr-nb", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, T("path", { d: "M0 0 L10 5 L0 10 z", style: "fill:var(--nama)" })));
    d += T("text", { x: 340, y: 136, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "rebirth-linking takes the same object as the last javanas: a kamma, a kamma sign or a destiny sign");
    d += T("text", { x: gx, y: 24, "class": "tx-xs tx-mu" }, "near death, javanas run only five times, their impulse weakened");
    $("death").innerHTML = d;
  })();

  /* ---------- plate 11: planes ---------- */
  (function () {
    var P = [
      ["Immaterial", "Nevasaññānāsaññāyatana", "neither perception nor non-perception", "N", 84000],
      ["Immaterial", "Ākiñcaññāyatana", "nothingness", "N", 60000],
      ["Immaterial", "Viññāṇañcāyatana", "infinite consciousness", "N", 40000],
      ["Immaterial", "Ākāsānañcāyatana", "infinite space", "N", 20000],
      ["4th jhāna", "Akaniṭṭha", "highest · pure abode", "NR", 16000],
      ["4th jhāna", "Sudassī", "clear-sighted · pure abode", "NR", 8000],
      ["4th jhāna", "Sudassa", "beautiful · pure abode", "NR", 4000],
      ["4th jhāna", "Atappa", "serene · pure abode", "NR", 2000],
      ["4th jhāna", "Aviha", "durable · pure abode", "NR", 1000],
      ["4th jhāna", "Asaññasatta", "non-percipient beings", "R", 500],
      ["4th jhāna", "Vehapphala", "great reward", "NR", 500],
      ["3rd jhāna", "Subhakiṇha", "steady aura", "NR", 64],
      ["3rd jhāna", "Appamāṇasubha", "infinite aura", "NR", 32],
      ["3rd jhāna", "Parittasubha", "minor aura", "NR", 16],
      ["2nd jhāna", "Ābhassara", "radiant lustre", "NR", 8],
      ["2nd jhāna", "Appamāṇābha", "infinite lustre", "NR", 4],
      ["2nd jhāna", "Parittābha", "minor lustre", "NR", 2],
      ["1st jhāna", "Mahābrahmā", "Great Brahmās · 1 incalculable aeon", "NR", 0.25],
      ["1st jhāna", "Brahmapurohita", "Brahmā's ministers · ½ incalculable", "NR", 0.125],
      ["1st jhāna", "Brahmapārisajja", "Brahmā's retinue · ⅓ incalculable", "NR", 1 / 12],
      ["Sense heavens", "Paranimmitavasavattī", "wielding power over others' creations", "NR", 9216e6, "16,000 celestial yrs"],
      ["Sense heavens", "Nimmānarati", "delighting in creation", "NR", 2304e6, "8,000"],
      ["Sense heavens", "Tusita", "the contented", "NR", 576e6, "4,000"],
      ["Sense heavens", "Yāma", "the Yāma gods", "NR", 144e6, "2,000"],
      ["Sense heavens", "Tāvatiṃsa", "the Thirty-three", "NR", 36e6, "1,000"],
      ["Sense heavens", "Cātumahārājika", "the Four Great Kings", "NR", 9e6, "500"],
      ["Human", "Manussa", "human beings", "NR", null],
      ["Woeful", "Asurakāya", "titans", "NR", null],
      ["Woeful", "Pettivisaya", "hungry ghosts", "NR", null],
      ["Woeful", "Tiracchānayoni", "animals", "NR", null],
      ["Woeful", "Niraya", "hell", "NR", null]
    ];
    var s = "", rh = 20, top = 42, bx0 = 318, bx1 = 640;
    var lg0 = -1.2, lg1 = 5;
    function xb(v) { return bx0 + (Math.log10(v) - lg0) / (lg1 - lg0) * (bx1 - bx0); }
    var dy0 = 6, dy1 = 10.2;
    function xd(v) { return bx0 + (Math.log10(v) - dy0) / (dy1 - dy0) * (bx1 - bx0); }
    function rowY(i) { return top + i * rh + (i >= 20 ? 34 : 0) + (i >= 26 ? 6 : 0); }
    var bandEnd = rowY(19) + rh;
    [0.1, 1, 10, 100, 1000, 10000, 100000].forEach(function (v) {
      var x = f1(xb(v));
      s += T("line", { x1: x, y1: top - 6, x2: x, y2: bandEnd, "class": "st-line" });
      s += T("text", { x: x, y: top - 10, "text-anchor": "middle", "class": "tx-xs tx-mu" }, v >= 1000 ? (v / 1000) + "k" : v);
    });
    s += T("text", { x: bx0, y: 14, "class": "tx-xs tx-b tx-mu" }, "GREAT AEONS (log scale)");
    var dTop = rowY(20), dEnd = rowY(25) + rh;
    [1e7, 1e8, 1e9, 1e10].forEach(function (v, i) {
      var x = f1(xd(v));
      s += T("line", { x1: x, y1: dTop - 4, x2: x, y2: dEnd, "class": "st-line" });
      s += T("text", { x: x, y: dTop - 8, "text-anchor": "middle", "class": "tx-xs tx-mu" }, ["10 million", "100 million", "1 billion", "10 billion"][i]);
    });
    s += T("text", { x: bx0, y: dTop - 22, "class": "tx-xs tx-b tx-mu" }, "HUMAN YEARS (log scale)");
    var groupsSeen = {};
    P.forEach(function (p, i) {
      var y = rowY(i);
      if (i % 2 === 0) s += T("rect", { x: 70, y: y, width: 610, height: rh, "class": "fl-faint" });
      s += T("text", { x: 78, y: y + 9, "class": "tx-it", style: "font-size:10.2px" }, p[1]);
      s += T("text", { x: 78, y: y + 18, "class": "tx-mu", style: "font-size:7.8px" }, p[2]);
      var gx = 300, gy = y + rh / 2;
      if (p[3] === "N") s += T("circle", { cx: gx, cy: gy, r: 5, style: "fill:var(--nama)" });
      else if (p[3] === "R") s += T("rect", { x: gx - 5, y: gy - 5, width: 10, height: 10, style: "fill:var(--rupa-mark)" });
      else s += T("path", { d: "M" + gx + " " + (gy - 5) + " A5 5 0 0 0 " + gx + " " + (gy + 5) + " Z", style: "fill:var(--nama)" }) + T("rect", { x: gx, y: gy - 5, width: 5, height: 10, style: "fill:var(--rupa-mark)" });
      if (p[4] !== null) {
        var isDeva = i >= 20;
        var x = isDeva ? xd(p[4]) : xb(p[4]);
        var col = i < 4 ? "var(--nama)" : (isDeva ? "var(--rupa-mark)" : "var(--nama-2)");
        s += T("rect", { x: bx0, y: y + 5, width: f1(Math.max(2, x - bx0)), height: rh - 10, rx: 2, style: "fill:" + col });
        var lbl = isDeva ? (p[4] >= 1e9 ? (p[4] / 1e9).toLocaleString("en-US", { maximumFractionDigits: 3 }) + " bn yrs" : (p[4] / 1e6).toLocaleString("en-US") + " m yrs") + " · " + p[5] : (p[4] >= 1 ? p[4].toLocaleString("en-US") : (p[4] === 0.25 ? "¼" : p[4] === 0.125 ? "⅛" : "1/12"));
        var inside = x - bx0 > 150;
        s += T("text", { x: f1(inside ? x - 6 : x + 6), y: y + 14, "text-anchor": inside ? "end" : "start", "class": "tx-xs tx-b " + (inside ? "tx-onac" : "") }, lbl);
      } else {
        s += T("text", { x: bx0, y: y + 14, "class": "tx-xs tx-mu" }, i === 26 ? "no fixed span: it varies with the age of the world" : "no fixed span");
      }
      if (!groupsSeen[p[0]]) {
        groupsSeen[p[0]] = true;
        var n = P.filter(function (q) { return q[0] === p[0]; }).length, y1 = y + n * rh;
        s += T("path", { d: "M66 " + (y + 2) + " H60 V" + (y1 - 2) + " H66", fill: "none", "class": "st-mu" });
        var yy = (y + y1) / 2;
        if (n >= 3) s += T("text", { x: 52, y: yy, transform: "rotate(-90 52 " + yy + ")", "text-anchor": "middle", "class": "tx-xs tx-b tx-mu" }, p[0].toUpperCase());
        else s += T("text", { x: 56, y: yy + 3, "text-anchor": "end", "class": "tx-xs tx-b tx-mu" }, p[0]);
      }
    });
    var bigBrackets = [["IMMATERIAL · 4", 0, 4], ["FINE-MATERIAL · 16", 4, 20], ["SENSE-SPHERE · 11", 20, 31]];
    bigBrackets.forEach(function (b) {
      var y0 = rowY(b[1]) + 2, y1 = rowY(b[2] - 1) + rh - 2, yy = (y0 + y1) / 2;
      s += T("path", { d: "M26 " + y0 + " H20 V" + y1 + " H26", fill: "none", "class": "st-ink" });
      s += T("text", { x: 12, y: yy, transform: "rotate(-90 12 " + yy + ")", "text-anchor": "middle", "class": "tx-xs tx-b" }, b[0]);
    });
    $("planes").innerHTML = s;
  })();

  /* ---------- plate 12: meditation ---------- */
  (function () {
    var TP = { lust: ["var(--t-lust)", "lustful"], hate: ["var(--t-hate)", "hateful"], del: ["var(--t-del)", "deluded"], spec: ["var(--t-spec)", "speculative"], faith: ["var(--t-faith)", "faithful"], int: ["var(--t-int)", "intelligent"], all: ["var(--t-all)", "all temperaments"] };
    var R = { acc: [0, "access"], j1: [1], j4: [1, 2, 3, 4], j5o: [5], j5: [1, 2, 3, 4, 5], ar: [0, "immaterial"] };
    var G = [
      ["Kasiṇas", "10", [["earth", "all", "j5"], ["water", "all", "j5"], ["fire", "all", "j5"], ["air", "all", "j5"], ["blue", "hate", "j5"], ["yellow", "hate", "j5"], ["red", "hate", "j5"], ["white", "hate", "j5"], ["light", "all", "j5"], ["limited space", "all", "j5"]]],
      ["Foulness", "10 corpses", [["bloated", "lust", "j1"], ["livid", "lust", "j1"], ["festering", "lust", "j1"], ["cut up", "lust", "j1"], ["gnawed", "lust", "j1"], ["scattered", "lust", "j1"], ["hacked and scattered", "lust", "j1"], ["bleeding", "lust", "j1"], ["worm-infested", "lust", "j1"], ["skeleton", "lust", "j1"]]],
      ["Recollections", "10", [["the Buddha", "faith", "acc"], ["the Dhamma", "faith", "acc"], ["the Saṅgha", "faith", "acc"], ["virtue", "faith", "acc"], ["generosity", "faith", "acc"], ["deities", "faith", "acc"], ["peace", "int", "acc"], ["death", "int", "acc"], ["the body", "lust", "j1"], ["breathing", "del+spec", "j5"]]],
      ["Illimitables", "4", [["loving-kindness", "hate", "j4"], ["compassion", "hate", "j4"], ["appreciative joy", "hate", "j4"], ["equanimity", "hate", "j5o"]]],
      ["Perception", "1", [["repulsiveness of food", "int", "acc"]]],
      ["Analysis", "1", [["the four elements", "int", "acc"]]],
      ["Immaterial", "4", [["infinite space", "all", "ar"], ["infinite consciousness", "all", "ar"], ["nothingness", "all", "ar"], ["neither perception nor non-perception", "all", "ar"]]]
    ];
    function card(m) {
      var ts = m[1].split("+");
      var bar = ts.length === 2 ? "background:linear-gradient(90deg," + TP[ts[0]][0] + " 50%," + TP[ts[1]][0] + " 50%)" : "background:" + TP[ts[0]][0];
      var r = R[m[2]], rc = "";
      if (r[0] === 0) rc = "<em>" + r[1].toUpperCase() + "</em>";
      else for (var i = 1; i <= 5; i++) rc += '<i class="' + (r.indexOf(i) >= 0 ? "on" : "") + '"></i>';
      return '<div class="med"><div class="bar" style="' + bar + '"></div><div class="nm2">' + m[0] + '</div><div class="rc">' + rc + "</div></div>";
    }
    $("medgrid").innerHTML = G.map(function (g) {
      return '<div class="medrow"><div class="rh">' + g[0] + "<span>" + g[1] + '</span></div><div class="meds">' + g[2].map(card).join("") + "</div></div>";
    }).join("");
    var counts = { lust: 11, hate: 8, del: 1, spec: 1, faith: 6, int: 4, all: 10 };
    $("temper-legend").innerHTML = Object.keys(TP).map(function (k) {
      return '<span><i style="background:' + TP[k][0] + '"></i>' + TP[k][1] + " · " + counts[k] + "</span>";
    }).join("") + '<span><i style="background:var(--nama)"></i>jhāna reached, 1st to 5th</span>';

    var s = "";
    var st = [["preliminary sign", "parikamma-nimitta", "the disc of earth itself, gazed at", 0], ["learning sign", "uggaha-nimitta", "the same disc seen with eyes closed, flaws and all", 1], ["counterpart sign", "paṭibhāga-nimitta", "purified, flawless, like the moon's disc from behind a cloud", 2]];
    st.forEach(function (t, i) {
      var x = 55 + i * 110;
      if (i === 0) {
        s += T("circle", { cx: x, cy: 46, r: 28, style: "fill:#a2763a;stroke:var(--rupa);stroke-width:1.5" });
        s += T("circle", { cx: x - 9, cy: 40, r: 3, style: "fill:#7c5527" });
        s += T("circle", { cx: x + 10, cy: 54, r: 2.5, style: "fill:#7c5527" });
      } else if (i === 1) {
        s += T("circle", { cx: x, cy: 46, r: 28, style: "fill:var(--rupa-soft);stroke:var(--rupa);stroke-width:1.5;stroke-dasharray:3 2" });
        s += T("circle", { cx: x - 9, cy: 40, r: 3, style: "fill:var(--rupa-mark)" });
      } else {
        s += T("circle", { cx: x, cy: 46, r: 28, style: "fill:var(--sheet);stroke:var(--nama);stroke-width:2.5" });
        s += T("circle", { cx: x, cy: 46, r: 20, style: "fill:var(--nama-soft)" });
      }
      s += T("text", { x: x, y: 92, "text-anchor": "middle", "class": "tx-s tx-b" }, t[0]);
      s += T("text", { x: x, y: 104, "text-anchor": "middle", "class": "tx-xs tx-it tx-nm" }, t[1]);
      if (i < 2) s += T("path", { d: "M" + (x + 36) + " 46 h36 m-6 -5 l6 5 l-6 5", style: "fill:none;stroke:var(--muted);stroke-width:1.4" });
    });
    s += T("text", { x: 0, y: 124, "class": "tx-xs tx-mu" }, "preliminary development → access, when the counterpart sign appears →");
    s += T("text", { x: 0, y: 136, "class": "tx-xs tx-mu" }, "absorption (jhāna), when the factors grow strong.");
    $("signs").innerHTML = s;
  })();

  /* ---------- plate 13: tree ---------- */
  (function () {
    var s = "", cx = 340;
    s += T("rect", { x: 20, y: 470, width: 640, height: 80, rx: 6, style: "fill:var(--rupa-soft)" });
    s += T("text", { x: 34, y: 488, "class": "tx-xs tx-b tx-rp" }, "SOIL · WHAT IS TO BE UNDERSTOOD");
    ["aggregates", "sense bases", "elements", "faculties", "noble truths", "dependent origination"].forEach(function (t, i) {
      var x = 34 + i * 104;
      s += T("rect", { x: x, y: 500, width: 96, height: 34, rx: 4, style: "fill:var(--sheet);stroke:var(--rupa-mark)" });
      if (t.length > 14) s += T("text", { x: x + 48, y: 515, "text-anchor": "middle", "class": "tx-s" }, t.split(" ")[0]) + T("text", { x: x + 48, y: 527, "text-anchor": "middle", "class": "tx-s" }, t.split(" ").slice(1).join(" "));
      else s += T("text", { x: x + 48, y: 521, "text-anchor": "middle", "class": "tx-s" }, t);
    });
    s += T("path", { d: "M" + (cx - 20) + " 470 C" + (cx - 40) + " 485, " + (cx - 120) + " 490, " + (cx - 170) + " 500 M" + (cx + 20) + " 470 C" + (cx + 40) + " 485, " + (cx + 120) + " 490, " + (cx + 170) + " 500", style: "fill:none;stroke:var(--rupa);stroke-width:3" });
    var roots = [["1", "Purification of virtue", "sīla-visuddhi · a root", cx - 150], ["2", "Purification of mind", "citta-visuddhi · access or jhāna", cx + 150]];
    roots.forEach(function (r) {
      s += T("path", { d: "M" + (r[3] + (r[3] < cx ? 40 : -40)) + " 426 Q" + (r[3] + (r[3] < cx ? 60 : -60)) + " 418 " + (cx + (r[3] < cx ? -98 : 98)) + " 414", style: "fill:none;stroke:var(--rupa);stroke-width:2" });
      s += T("rect", { x: r[3] - 92, y: 426, width: 184, height: 36, rx: 18, style: "fill:var(--sheet);stroke:var(--rupa);stroke-width:1.6" });
      s += T("text", { x: r[3], y: 441, "text-anchor": "middle", "class": "tx-s tx-b" }, r[0] + " · " + r[1]);
      s += T("text", { x: r[3], y: 454, "text-anchor": "middle", "class": "tx-xs tx-it tx-mu" }, r[2]);
    });
    var trunk = [
      ["3", "Purification of view", "defining nāma-rūpa · pl. 2–5", []],
      ["4", "Overcoming doubt", "discerning conditions · pl. 8–9", []],
      ["5", "Knowledge of path and not-path", "telling true insight from its imitations", ["comprehension", "rise and fall (tender)"]],
      ["6", "Knowledge of the way", "nine insight knowledges", ["rise and fall (mature)", "dissolution", "fearfulness", "danger", "disenchantment", "desire for deliverance", "reflection", "equanimity about formations", "conformity"]],
      ["7", "Knowledge and vision", "path knowledge", []]
    ];
    var tw = 200, ty = 418, heights = [38, 38, 48, 120, 40];
    s += T("path", { d: "M" + (cx - tw / 2) + " " + ty + " V" + (ty - heights.reduce(function (a, b) { return a + b; }, 0)) + " M" + (cx + tw / 2) + " " + ty + " V" + (ty - heights.reduce(function (a, b) { return a + b; }, 0)), style: "stroke:var(--rupa);stroke-width:2" });
    var y = ty;
    trunk.forEach(function (t, i) {
      var h = heights[i];
      y -= h;
      s += T("rect", { x: cx - tw / 2 + 2, y: y + 2, width: tw - 4, height: h - 4, rx: 4, style: "fill:" + (i === 4 ? "var(--nama)" : "var(--nama-soft)") });
      s += T("text", { x: cx, y: y + 18, "text-anchor": "middle", "class": "tx-s tx-b " + (i === 4 ? "tx-onac" : "") }, t[0] + " · " + t[1]);
      s += T("text", { x: cx, y: y + 31, "text-anchor": "middle", "class": "tx-xs " + (i === 4 ? "tx-onac" : "tx-mu") }, t[2]);
      if (t[3].length) {
        var lx = cx + tw / 2 + 18;
        s += T("path", { d: "M" + (cx + tw / 2) + " " + (y + h / 2) + " H" + (lx - 6), style: "fill:none;stroke:var(--nama-2);stroke-width:1.2" });
        var startY = y + h / 2 - (t[3].length - 1) * 6.5;
        t[3].forEach(function (k, j) {
          s += T("text", { x: lx, y: f1(startY + j * 13 + 3), "class": "tx-s" }, (i === 4 ? "" : "") + k);
        });
        s += T("path", { d: "M" + (lx - 6) + " " + f1(startY - 4) + " V" + f1(startY + (t[3].length - 1) * 13 + 4), style: "fill:none;stroke:var(--nama-2);stroke-width:1.2" });
      }
    });
    s += T("text", { x: cx - tw / 2 - 14, y: ty - 120, "text-anchor": "end", "class": "tx-xs tx-b tx-mu" }, "THE TRUNK");
    s += T("text", { x: cx - tw / 2 - 14, y: ty - 107, "text-anchor": "end", "class": "tx-xs tx-mu" }, "purifications 3 to 7");
    s += T("text", { x: cx - tw / 2 - 14, y: ty - 94, "text-anchor": "end", "class": "tx-xs tx-mu" }, "are wisdom itself");
    var crownY = y - 26;
    s += T("ellipse", { cx: cx, cy: crownY - 30, rx: 230, ry: 58, style: "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1.4" });
    var seq = [["change of lineage", "gotrabhū"], ["path", "1 moment"], ["fruition", "2–3 moments"], ["reviewing", "paccavekkhaṇa"]];
    seq.forEach(function (q, i) {
      var x = cx - 165 + i * 110;
      s += T("rect", { x: x - 46, y: crownY - 52, width: 92, height: 34, rx: 6, style: "fill:" + (i === 1 || i === 2 ? "var(--nib)" : "var(--sheet)") + ";stroke:var(--nib)" });
      s += T("text", { x: x, y: crownY - 37, "text-anchor": "middle", "class": "tx-s tx-b " + (i === 1 || i === 2 ? "tx-onac" : "") }, q[0]);
      s += T("text", { x: x, y: crownY - 25, "text-anchor": "middle", "class": "tx-xs " + (i === 1 || i === 2 ? "tx-onac" : "tx-mu") }, q[1]);
      if (i < 3) s += T("path", { d: "M" + (x + 48) + " " + (crownY - 35) + " h14", style: "fill:none;stroke:var(--nib);stroke-width:1.4" });
    });
    s += T("text", { x: cx, y: crownY - 66, "text-anchor": "middle", "class": "tx-s tx-b tx-nb" }, "THE CROWN · object: Nibbāna");
    $("tree").innerHTML = s;

    var F = [["personality view", "f", "", "", ""], ["doubt", "f", "", "", ""], ["clinging to rites and rules", "f", "", "", ""], ["sensual desire", "", "w", "f", ""], ["ill will", "", "w", "f", ""],
      ["lust for fine-material being", "", "", "", "f"], ["lust for immaterial being", "", "", "", "f"], ["conceit", "", "", "", "f"], ["restlessness", "", "", "", "f"], ["ignorance", "", "", "", "f"]];
    $("fetters").innerHTML = "<thead><tr><th>Fetter</th><th>Stream-entry</th><th>Once-return</th><th>Non-return</th><th>Arahantship</th></tr></thead><tbody>" +
      F.map(function (r) { return "<tr><td>" + r[0] + "</td>" + r.slice(1).map(function (c) { return "<td>" + (c ? '<i class="' + c + '"></i>' : "") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
  })();

  /* ---------- plate 14: compare ---------- */
  (function () {
    var cats = [["citta", "consciousness", "var(--nama)"], ["cetasika", "mental factors", "var(--nama-2)"], ["rūpa", "matter", "var(--rupa-mark)"], ["viprayukta", "dissociated formations", "var(--g3)"], ["asaṅkhata", "unconditioned", "var(--nib)"]];
    var rows = [["Theravāda", "82", [1, 52, 28, 0, 1]], ["Sarvāstivāda", "75", [1, 46, 11, 14, 3]], ["Yogācāra", "100", [8, 51, 11, 24, 6]]];
    var s = "", x0 = 112, sc = 5.2;
    rows.forEach(function (r, i) {
      var y = 14 + i * 50, x = x0;
      s += T("text", { x: 0, y: y + 18, "class": "tx-l tx-d" }, r[0]);
      s += T("text", { x: 0, y: y + 32, "class": "tx-s tx-mu" }, r[1] + " elements");
      r[2].forEach(function (v, j) {
        if (!v) return;
        s += T("rect", { x: f1(x), y: y + 6, width: f1(v * sc - 1.5), height: 26, rx: 2, style: "fill:" + cats[j][2] });
        if (v * sc > 16) s += T("text", { x: f1(x + v * sc / 2), y: y + 23, "text-anchor": "middle", "class": "tx-s tx-b tx-onac" }, v);
        else s += T("text", { x: f1(x + v * sc / 2), y: y + 44, "text-anchor": "middle", "class": "tx-xs tx-b" }, v);
        x += v * sc;
      });
    });
    $("compare").innerHTML = s;
  })();
})();
