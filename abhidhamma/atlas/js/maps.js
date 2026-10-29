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
        '<p class="small">' + n.d + " " + n.p.map(xr).join(" ") + "</p>" +
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
