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
      ["Vibhaṅga", "Book of analysis", "Eighteen chapters, each treated by the sutta method, the Abhidhamma method and by questions.", false],
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

  /* ---------- plate 3: citta map ---------- */
  var FEEL = { J: "var(--f-joy)", E: "var(--f-eq)", S: "var(--f-ple)", P: "var(--f-pain)", D: "var(--f-dis)" };
  (function () {
    var rows = [
      { t: "Unwholesome", n: 12, g: [["greed-rooted", "JJJJEEEE"], ["hate-rooted", "DD"], ["delusion-rooted", "EE"]] },
      { t: "Rootless", n: 18, g: [["unwholesome-resultant", "EEEEPEE"], ["wholesome-resultant", "EEEESEJE"], ["functional", "EEJ"]] },
      { t: "Beautiful", n: 24, g: [["wholesome", "JJJJEEEE"], ["resultant", "JJJJEEEE"], ["functional", "JJJJEEEE"]] },
      { t: "Fine-material", n: 15, g: [["wholesome", "JJJJE"], ["resultant", "JJJJE"], ["functional", "JJJJE"]] },
      { t: "Immaterial", n: 12, g: [["wholesome", "EEEE"], ["resultant", "EEEE"], ["functional", "EEEE"]] },
      { t: "Supramundane", n: 8, g: [["path", "VVVV"], ["fruit", "VVVV"]] }
    ];
    var x0 = 132, cell = 19, step = 21, gg = 12, rowH = 50, y0 = 14, s = "", num = 1;
    s += T("defs", {}, T("clipPath", { id: "cl" }, T("rect", { width: cell, height: cell, rx: 3 })));
    rows.forEach(function (r, ri) {
      var y = y0 + ri * rowH + (ri >= 3 ? 10 : 0);
      s += T("text", { x: 22, y: y + 25, "class": "tx-l tx-d" }, r.t);
      s += T("text", { x: 22, y: y + 38, "class": "tx-s tx-mu" }, r.n + " cittas");
      var x = x0;
      r.g.forEach(function (g) {
        s += T("text", { x: x, y: y + 10, "class": "tx-xs tx-mu" }, g[0] + " " + g[1].length);
        for (var i = 0; i < g[1].length; i++) {
          var f = g[1][i], cx = x + i * step, cyy = y + 16;
          if (f === "V") {
            s += T("g", { transform: "translate(" + cx + "," + cyy + ")" },
              T("rect", { width: cell, height: cell, rx: 3, style: "fill:var(--f-eq)" }) +
              T("path", { d: "M0 0 H" + cell + " L0 " + cell + " Z", "clip-path": "url(#cl)", style: "fill:var(--f-joy)" }));
          } else {
            s += T("rect", { x: cx, y: cyy, width: cell, height: cell, rx: 3, style: "fill:" + FEEL[f] });
          }
          s += T("text", { x: cx + cell / 2, y: cyy + 13, "text-anchor": "middle", "class": "tx-xs " + (f === "D" ? "tx-on" : "tx-cell") }, num++);
        }
        x += g[1].length * step + gg;
      });
    });
    var yb = y0, ye = y0 + 3 * rowH - 6;
    s += T("path", { d: "M14 " + yb + " H8 V" + ye + " H14", fill: "none", "class": "st-mu", "stroke-width": 1 });
    s += T("text", { x: 4, y: (yb + ye) / 2, transform: "rotate(-90 4 " + (yb + ye) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "SENSE-SPHERE 54");
    $("citta-map").innerHTML = s;

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

  /* ---------- plate 4: ensemble ---------- */
  (function () {
    var cx = 330, cy = 318, s = "";
    var uni = ["phassa", "vedanā", "saññā", "cetanā", "ekaggatā", "jīvitindriya", "manasikāra"];
    var occ = ["vitakka", "vicāra", "adhimokkha", "viriya", "pīti", "chanda"];
    var bad = ["moha", "ahirika", "anottappa", "uddhacca", "lobha", "diṭṭhi", "māna", "dosa", "issā", "macchariya", "kukkucca", "thīna", "middha", "vicikicchā"];
    var good = ["saddhā", "sati", "hiri", "ottappa", "alobha", "adosa", "tatramajjhattatā", "kāya-passaddhi", "citta-passaddhi", "kāya-lahutā", "citta-lahutā", "kāya-mudutā", "citta-mudutā", "kāya-kammaññatā", "citta-kammaññatā", "kāya-pāguññatā", "citta-pāguññatā", "kāyujjukatā", "cittujjukatā", "sammā-vācā", "sammā-kammanta", "sammā-ājīva", "karuṇā", "muditā", "paññindriya"];
    function place(list, r, a0, a1, fill, cls) {
      var n = list.length;
      list.forEach(function (name, i) {
        var a = n === 1 ? a0 : a0 + (a1 - a0) * i / (n - 1);
        var x = cx + r * Math.cos(rad(a)), y = cy + r * Math.sin(rad(a));
        s += T("circle", { cx: f1(x), cy: f1(y), r: 5.5, style: "fill:" + fill });
        var left = (((a % 360) + 360) % 360) > 90 && (((a % 360) + 360) % 360) < 270;
        var tx = cx + (r + 10) * Math.cos(rad(a)), ty = cy + (r + 10) * Math.sin(rad(a));
        var rot = left ? a + 180 : a;
        s += T("text", { x: f1(tx), y: f1(ty), transform: "rotate(" + f1(rot) + " " + f1(tx) + " " + f1(ty) + ")", "text-anchor": left ? "end" : "start", "dominant-baseline": "middle", "class": "tx-it " + cls, style: "font-size:11px" }, name);
      });
    }
    [72, 150, 235].forEach(function (r) { s += T("circle", { cx: cx, cy: cy, r: r, fill: "none", "class": "st-line" }); });
    s += T("circle", { cx: cx, cy: cy, r: 34, style: "fill:var(--nama)" });
    s += T("text", { x: cx, y: cy + 5, "text-anchor": "middle", "class": "tx-l tx-it tx-onac" }, "citta");
    place(uni, 72, -90, -90 + 360 * 6 / 7, "var(--nama)", "");
    place(occ, 150, -60, 240, "var(--nama-2)", "");
    place(good, 235, -75, 75, "var(--nama)", "tx-nm");
    place(bad, 235, 105, 255, "var(--bad)", "tx-bd");
    s += T("text", { x: cx, y: cy + 110, "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "UNIVERSALS 7 · IN EVERY CITTA");
    s += T("text", { x: cx, y: cy + 185, "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "OCCASIONALS 6 · EITHER SIDE");
    s += T("text", { x: 236, y: 638, "text-anchor": "end", "class": "tx-m tx-b tx-bd" }, "UNWHOLESOME 14");
    s += T("text", { x: 424, y: 638, "class": "tx-m tx-b tx-nm" }, "BEAUTIFUL 25");
    s += T("line", { x1: cx, y1: 580, x2: cx, y2: 642, "class": "st-mu", "stroke-dasharray": "3 3" });
    s += T("text", { x: cx, y: 600, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "never in");
    s += T("text", { x: cx, y: 611, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "one citta");
    $("ensemble").innerHTML = s;

    var bars = [
      ["Eye-consciousness", 7, 0, 0], ["Five-door adverting", 10, 0, 0], ["Investigating, with joy", 11, 0, 0], ["Smile-producing", 12, 0, 0],
      ["Rooted in delusion, with restlessness", 15, 0, 1], ["Rooted in greed, first", 19, 0, 1], ["Fifth jhāna, wholesome", 30, 0, 0],
      ["First jhāna, wholesome", 33, 2, 0], ["Path at the first jhāna", 36, 0, 0], ["Sense-sphere wholesome, first", 33, 5, 0]
    ];
    var b = "", lx = 224, sc = 10.6, h = 15, gap = 21;
    [10, 20, 30].forEach(function (v) {
      b += T("line", { x1: lx + v * sc, y1: 0, x2: lx + v * sc, y2: bars.length * gap, "class": "st-line" });
    });
    bars.forEach(function (r, i) {
      var y = i * gap + 3;
      b += T("text", { x: lx - 8, y: y + 11.5, "text-anchor": "end", "class": "tx-m" }, r[0]);
      b += T("rect", { x: lx, y: y, width: r[1] * sc, height: h, rx: 2, style: "fill:" + (r[3] ? "var(--bad)" : "var(--nama)") });
      if (r[2]) b += T("rect", { x: lx + r[1] * sc + 1, y: y + .5, width: r[2] * sc - 1, height: h - 1, rx: 2, style: "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:3 2" });
      b += T("text", { x: lx + (r[1] + r[2]) * sc + 6, y: y + 11.5, "class": "tx-m tx-b" }, (r[1] + r[2]) + (r[2] ? "  (" + r[1] + " + " + r[2] + ")" : ""));
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
    var who = [["A child", "sees shapes and colours", "saññā · perception", 0], ["A villager", "knows: money, can be spent", "viññāṇa · consciousness", 1], ["A money-changer", "knows: genuine or false, origin, weight", "paññā · understanding", 2]];
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

  /* ---------- plate 6: mango ---------- */
  var KC = { bh: "k-bh", pr: "k-pr", vi: "k-vi", ja: "k-ja", ta: "k-ta" };
  (function () {
    var rows = [
      ["Atīta-bhavaṅga", "past life-continuum", "bh"], ["Bhavaṅga-calana", "vibrating life-continuum", "bh"], ["Bhavaṅgupaccheda", "arrest of life-continuum", "bh"],
      ["Pañcadvārāvajjana", "five-door adverting", "pr"], ["Cakkhu-viññāṇa", "eye-consciousness", "vi"], ["Sampaṭicchana", "receiving", "pr"],
      ["Santīraṇa", "investigating", "pr"], ["Voṭṭhapana", "determining", "pr"]
    ];
    for (var j = 1; j <= 7; j++) rows.push(["Javana " + j, "impulsion", "ja"]);
    rows.push(["Tadārammaṇa 1", "registration", "ta"], ["Tadārammaṇa 2", "registration", "ta"], ["Bhavaṅga", "life-continuum", "bh"]);
    var scenes = {
      0: [3, "A man sleeps at the foot of a mango tree, his head covered. A breeze stirs the branches and a mango falls beside his head.", ""],
      3: [1, "He uncovers his head and turns toward the fruit.", ""],
      4: [1, "He sees it.", ""],
      5: [1, "He picks it up.", ""],
      6: [1, "He looks it over.", ""],
      7: [1, "He decides: a ripe mango.", ""],
      8: [7, "He eats it. Here, and only here, the mind acts: liking or disliking, wisdom or its absence. This is where kamma is made. <a class='xr' href='#p10'>→ 10</a>", ""],
      15: [2, "He swallows the last of it. †", "later"],
      17: [1, "He goes back to sleep. †", "later"]
    };
    var h = "";
    rows.forEach(function (r, i) {
      h += "<tr><td class=\"n\">" + (i < 17 ? i + 1 : "") + "</td><td class=\"c\"><i class=\"" + KC[r[2]] + "\"></i></td><td class=\"st\"><b>" + r[0] + "</b> <span>" + r[1] + "</span></td>";
      if (scenes[i]) h += "<td class=\"sc " + scenes[i][2] + "\" rowspan=\"" + scenes[i][0] + "\">" + scenes[i][1] + "</td>";
      h += "</tr>";
    });
    $("mango").innerHTML = "<tbody>" + h + "</tbody>";

    var strips = [
      ["Very great object: complete, with registration", "a bh bu pa vi pr pr pr ja ja ja ja ja ja ja ta ta"],
      ["Great: 2–3 past moments, no registration", "a a a bh bu pa vi pr pr pr ja ja ja ja ja ja ja"],
      ["Slight: no javana; determining repeats", "a a a a a bh bu pa vi pr pr pr pr pr b b b"],
      ["Very slight: the life-continuum only vibrates", "a a a a a a a a a a a a bh bh b b b"],
      ["Mind-door, clear object", "bh bu ma ja ja ja ja ja ja ja ta ta"]
    ];
    var map = { a: "bh", b: "bh", bh: "bh2", bu: "bh2", pa: "pr", ma: "pr", vi: "vi", pr: "pr", ja: "ja", ta: "ta" };
    var fills = {
      bh: "fill:var(--faint);stroke:var(--line)", bh2: "fill:var(--line);stroke:var(--line)", pr: "fill:var(--nama-soft);stroke:var(--nama-2)",
      vi: "fill:var(--sheet);stroke:var(--nama);stroke-width:2", ja: "fill:var(--nama);stroke:var(--nama)", ta: "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:2 2"
    };
    var s = "";
    strips.forEach(function (st, i) {
      var y = i * 41;
      s += T("text", { x: 0, y: y + 11, "class": "tx-s" + (i === 4 ? " tx-nm" : "") }, st[0]);
      st[1].split(" ").forEach(function (k, j) {
        s += T("rect", { x: j * 19 + .5, y: y + 17, width: 16, height: 16, rx: 2.5, style: fills[map[k]] });
      });
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
      s += T("text", { x: x0 + i * cw + cw / 2, y: 30, "text-anchor": "middle", "class": "tx-s tx-b" + (i === 4 ? " tx-mu" : "") }, c[1]);
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
    s += T("text", { x: 6, y: (b1 + b2) / 2, transform: "rotate(-90 6 " + (b1 + b2) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "CONCRETE 18");
    s += T("text", { x: 6, y: (b3 + b4) / 2, transform: "rotate(-90 6 " + (b3 + b4) / 2 + ")", "text-anchor": "middle", "class": "tx-xs tx-mu tx-b" }, "NON-CONCRETE 10");
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
      A: ["var(--g1)", "Mind → mind", "N", "N", "Each citta, as it ceases, gives way to the next: the stream has no gaps. Javanas strengthen their successors."],
      B: ["var(--g2)", "Mind → mind & matter", "N", "NR", "Roots, jhāna and path factors steady the citta, its factors and the matter it produces. Volition is kamma."],
      C: ["var(--g3)", "Mind → matter", "N", "R", "Later cittas sustain the body that arose before them. This is postnascence."],
      D: ["var(--g4)", "Matter → mind", "R", "N", "The eye, already arisen, supports the eye-consciousness that follows; so does a visible object already present."],
      E: ["var(--g5)", "Anything → mind", "CNR", "N", "Concepts, mind or matter can all be objects. A strong past experience, a teacher, a habit can decisively support what arises now."],
      F: ["var(--g6)", "Mind & matter → both", "NR", "NR", "Things that arise together hold each other up, like the three legs of a tripod."]
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
    var RC = { D: "var(--bad)", K: "var(--nama)", R: "var(--rupa-mark)" };
    function arc(r0, r1, a0, a1) {
      var p = function (r, a) { return f1(cx + r * Math.cos(rad(a))) + " " + f1(cy + r * Math.sin(rad(a))); };
      var large = (a1 - a0) > 180 ? 1 : 0;
      return "M" + p(r1, a0) + " A" + r1 + " " + r1 + " 0 " + large + " 1 " + p(r1, a1) + " L" + p(r0, a1) + " A" + r0 + " " + r0 + " 0 " + large + " 0 " + p(r0, a0) + " Z";
    }
    var periods = [["past", -90, -30, "var(--muted)"], ["present", -30, 210, "var(--nama)"], ["future", 210, 270, "var(--nib)"]];
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
      ["Present effects", ["consciousness", "mind and matter", "six sense bases", "contact", "feeling"], "var(--nama)"],
      ["Present causes", ["craving", "clinging", "becoming (kamma)", "ignorance", "formations"], "var(--nama)"],
      ["Future effects", ["consciousness", "mind and matter", "six sense bases", "contact", "feeling"], "var(--nib)"]
    ];
    $("modes").innerHTML = modes.map(function (m) {
      return '<div class="box"><h3 style="color:' + m[2] + '">' + m[0] + "</h3><ol>" + m[1].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div>";
    }).join("") ;
  })();

  /* ---------- plate 10: kamma ---------- */
  (function () {
    var rows = [
      ["By function: what does it do?", [["janaka", "productive: produces rebirth and results during life"], ["upatthambhaka", "supportive: strengthens another kamma's results"], ["upapīḷaka", "obstructive: weakens or delays them"], ["upaghātaka", "destructive: cuts another kamma off and takes its place"]]],
      ["By order: which ripens first at death?", [["garuka", "weighty: jhāna, or a heinous crime; nothing overrides it"], ["āsanna", "death-proximate: done or recalled just before death"], ["āciṇṇa", "habitual: what one does again and again"], ["kaṭattā", "reserve: anything done once, if nothing else is there"]]],
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
      ["this life", "weakest: first javana", 380, "var(--nib)", [0]],
      ["next life", "seventh javana", 500, "var(--nama)", [6]],
      ["any later life", "middle five", 620, "var(--nama-2)", [1, 2, 3, 4, 5]]
    ];
    targets.forEach(function (t, k) {
      var ty = 22 + k * 36;
      s += T("rect", { x: t[2] - 54, y: ty, width: 108, height: 28, rx: 14, style: "fill:var(--sheet);stroke:" + t[3] + ";stroke-width:1.6" });
      s += T("text", { x: t[2], y: ty + 12, "text-anchor": "middle", "class": "tx-s tx-b" }, t[0]);
      s += T("text", { x: t[2], y: ty + 23, "text-anchor": "middle", "class": "tx-xs tx-mu" }, t[1]);
      t[4].forEach(function (j) {
        var sx = x0 + j * st + w / 2;
        s += T("path", { d: "M" + sx + " 76 C" + sx + " 104, " + (t[2] - 80) + " " + (ty + 14) + ", " + (t[2] - 56) + " " + (ty + 14), style: "fill:none;stroke:" + t[3] + ";stroke-width:1.3;opacity:.85" });
      });
    });
    $("ripen").innerHTML = s;

    var d = "", cells = [["bh", "bhavaṅga"], ["bh2", "calana"], ["bh2", "upacch."], ["pr", "adverting"], ["ja", "J1"], ["ja", "J2"], ["ja", "J3"], ["ja", "J4"], ["ja", "J5"], ["cu", "death"], ["pa", "rebirth"], ["nb", "bhavaṅga"], ["nb", "bhavaṅga"]];
    var fills = {
      bh: "fill:var(--faint);stroke:var(--line)", bh2: "fill:var(--line);stroke:var(--line)", pr: "fill:var(--nama-soft);stroke:var(--nama-2)", ja: "fill:var(--nama);stroke:var(--nama)",
      cu: "fill:var(--sheet);stroke:var(--ink);stroke-width:2", pa: "fill:var(--nib);stroke:var(--nib)", nb: "fill:var(--nib-soft);stroke:var(--nib)"
    };
    var cw = 46, gx = 10;
    cells.forEach(function (c, i) {
      var x = gx + i * cw + (i >= 10 ? 14 : 0);
      d += T("rect", { x: x, y: 50, width: cw - 4, height: 30, rx: 4, style: fills[c[0]] });
      d += T("text", { x: x + (cw - 4) / 2, y: 69, "text-anchor": "middle", "class": "tx-xs " + (c[0] === "ja" || c[0] === "pa" ? "tx-onac tx-b" : "") }, c[1]);
    });
    var bx = gx + 10 * cw + 5;
    d += T("line", { x1: bx, y1: 30, x2: bx, y2: 100, "class": "st-ink", "stroke-width": 1.5, "stroke-dasharray": "4 3" });
    d += T("text", { x: bx - 6, y: 38, "text-anchor": "end", "class": "tx-s tx-b" }, "end of one life");
    d += T("text", { x: bx + 6, y: 38, "class": "tx-s tx-b tx-nb" }, "next life");
    d += T("path", { d: "M400 84 Q452 122 505 86", style: "fill:none;stroke:var(--nib);stroke-width:1.6", "marker-end": "url(#arr-nb)" });
    d += T("defs", {}, T("marker", { id: "arr-nb", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, T("path", { d: "M0 0 L10 5 L0 10 z", style: "fill:var(--nib)" })));
    d += T("text", { x: 340, y: 136, "text-anchor": "middle", "class": "tx-xs tx-mu" }, "rebirth-linking takes the same object as the last javanas: a kamma, a kamma sign or a destiny sign");
    d += T("text", { x: gx, y: 24, "class": "tx-xs tx-mu" }, "near death, javanas run only five times, too weak to ripen at once");
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
      s += T("text", { x: 78, y: y + 9.5, "class": "tx-m tx-it" }, p[1]);
      s += T("text", { x: 78, y: y + 18.5, "class": "tx-xs tx-mu" }, p[2]);
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
      s += T("text", { x: x + 48, y: 521, "text-anchor": "middle", "class": "tx-s" }, t);
    });
    s += T("path", { d: "M" + (cx - 20) + " 470 C" + (cx - 40) + " 485, " + (cx - 120) + " 490, " + (cx - 170) + " 500 M" + (cx + 20) + " 470 C" + (cx + 40) + " 485, " + (cx + 120) + " 490, " + (cx + 170) + " 500", style: "fill:none;stroke:var(--rupa);stroke-width:3" });
    var roots = [["1", "Purification of virtue", "sīla-visuddhi · a root", cx - 150], ["2", "Purification of mind", "citta-visuddhi · access or jhāna", cx + 150]];
    roots.forEach(function (r) {
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
    var tw = 150, ty = 418, heights = [38, 38, 48, 120, 40];
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
