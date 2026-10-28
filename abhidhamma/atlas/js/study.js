/* Abhidhamma Atlas: tools for slow study.
   The study method, the one-plate-a-week plan, the dhamma explorer, the identity cards
   and the review deck. Content comes from data.js (method, week, habits, plan, dhammas,
   deck). The plan and the deck remember a reader's progress in this browser only
   (localStorage); everything still works, without memory, where storage is blocked. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function xr(n) { return '<a class="xr" href="#p' + n + '">→ ' + n + "</a>"; }
  var ROM = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
  var D = window.ATLAS, PL = D.plates, LV = D.levels;
  function load(key) { try { var v = window.localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function save(key, v) { try { window.localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  var DEPTH = { learn: ["Learn", "var(--lv2)"], reflect: ["Reflect", "var(--lv4)"], observe: ["Observe", "var(--lv6)"], rest: ["Rest", "var(--line)"] };

  /* ---------------- how to study slowly ---------------- */
  (function () {
    var host = $("method"); if (!host) return;
    host.innerHTML = D.method.map(function (m, i) {
      return '<div class="mstep"><div class="mnum">' + (i + 1) + "</div><h3>" + m.t + ' <i>' + m.pali + "</i></h3>" +
        '<p><b>Tradition</b> ' + m.trad + "</p><p><b>Research</b> " + m.sci + '</p><p class="mtool"><b>In the atlas</b> ' + m.tool + "</p></div>";
    }).join("");
    var wk = $("week");
    if (wk) wk.innerHTML = D.week.map(function (d) {
      var dp = DEPTH[d[3]];
      return '<div class="wday"><span class="lab">' + d[0] + "</span><b>" + d[1] + '</b><p>' + d[2] + '</p><span class="wdep" style="border-color:' + dp[1] + '">' + dp[0] + "</span></div>";
    }).join("");
    var hb = $("habits");
    if (hb) hb.innerHTML = D.habits.map(function (h) { return "<li><b>" + h[0] + ".</b> " + h[1] + "</li>"; }).join("");
  })();

  /* ---------------- the study plan ---------------- */
  (function () {
    var host = $("plan-grid"); if (!host) return;
    var KEY = "abhidhamma-atlas:plan:v1", done = load(KEY) || {};
    var NAME = { learn: "path", study: "method", map: "map", threads: "threads", explorer: "explorer", idcards: "cards", deck: "deck" };
    function pageLink(id) {
      var m;
      if ((m = /^p(\d+)$/.exec(id))) return '<a href="#' + id + '" class="pl" style="background:var(--lv' + PL[m[1]].lv + ')">' + m[1] + "</a>";
      if ((m = /^L(\d)$/.exec(id))) return '<a href="#' + id + '">Level ' + ROM[m[1]] + "</a>";
      if ((m = /^D(\d)$/.exec(id))) return '<a href="#' + id + '">3D</a>';
      if ((m = /^S(\d)$/.exec(id))) return '<a href="#' + id + '">stories</a>';
      return '<a href="#' + id + '">' + (NAME[id] || id) + "</a>";
    }
    var days = D.week.slice(0, 6);
    var h = '<table class="plan"><thead><tr><th>Week</th><th>Study</th>' + days.map(function (d) { return "<th>" + d[1] + "</th>"; }).join("") + "</tr></thead><tbody>";
    D.plan.forEach(function (w) {
      h += "<tr><td class=\"wk\">" + w[0] + '</td><td class="what"><span>' + w[2] + '</span> <span class="pls">' + w[1].map(pageLink).join(" ") + "</span></td>";
      days.forEach(function (d, j) {
        var k = w[0] + "-" + j, on = !!done[k];
        h += '<td><button type="button" class="tk" data-k="' + k + '" aria-pressed="' + on + '" aria-label="Week ' + w[0] + ", " + d[1] + '"></button></td>';
      });
      h += "</tr>";
    });
    host.innerHTML = h + "</tbody></table>";
    var stat = $("plan-stat");
    function count() {
      var n = Object.keys(done).filter(function (k) { return done[k]; }).length, total = D.plan.length * days.length;
      if (stat) stat.textContent = n ? n + " of " + total + " sessions done" : "Tick a box when you finish a session. Your ticks stay in this browser.";
    }
    host.addEventListener("click", function (e) {
      var b = e.target.closest(".tk"); if (!b) return;
      var k = b.getAttribute("data-k"), on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      if (on) done[k] = 1; else delete done[k];
      save(KEY, done); count();
    });
    count();
  })();

  /* ---------------- one dhamma, many lenses ---------------- */
  var RC = { citta: "var(--nama)", cetasika: "var(--nama-2)", "rūpa": "var(--rupa-mark)", "Nibbāna": "var(--nib)" };
  function card(d, cls) {
    var L = ["Characteristic", "Function", "Manifestation", "Proximate cause"];
    return '<article class="idc' + (cls ? " " + cls : "") + '" style="--rc:' + RC[d.real] + '"><div class="idh"><b>' + d.pali + "</b><span>" + (d.en === d.real ? "the unconditioned" : d.en + " · " + d.real) + "</span></div><dl>" +
      d.card.map(function (c, i) { return "<dt>" + L[i] + "</dt><dd>" + c + "</dd>"; }).join("") + "</dl></article>";
  }
  (function () {
    var t = $("explorer-table"); if (!t) return;
    var COLS = [["real", "Reality", "paramattha"], ["agg", "Aggregate", "khandha"], ["base", "Base", "āyatana"], ["el", "Element", "dhātu"], ["truth", "Noble truth", "sacca"],
      ["kind", "Quality", "kusala triad"], ["res", "Result", "vipāka triad"], ["root", "Root", "hetu"], ["obj", "Takes an object", "ārammaṇa"]];
    var h = '<thead><tr><th>Dhamma</th>' + COLS.map(function (c) { return "<th>" + c[1] + "<i>" + c[2] + "</i></th>"; }).join("") + "<th>Plates</th></tr></thead><tbody>";
    D.dhammas.forEach(function (d) {
      h += '<tr data-id="' + d.id + '" tabindex="0"><th><b>' + d.pali + "</b><span>" + d.en + "</span></th>";
      COLS.forEach(function (c) {
        var v = d[c[0]];
        if (c[0] === "real") v = '<span class="rchip" style="background:' + RC[v] + '">' + v + "</span>";
        else if (c[0] === "root" || c[0] === "obj") v = v ? "●" : '<span class="muted">–</span>';
        else if (v === "none" || v === "varies") v = '<span class="muted">' + v + "</span>";
        else if (c[0] === "truth") v = v.replace(/(suffering|origin|cessation|path)/g, '<span class="tr-$1">$1</span>');
        h += "<td>" + v + "</td>";
      });
      h += '<td class="pls">' + d.p.join(" ") + "</td></tr>";
    });
    t.innerHTML = h + "</tbody>";
    var notes = $("explorer-notes");
    if (notes) notes.innerHTML = D.dhammaNotes.map(function (n) { return "<p>" + n + "</p>"; }).join("");
    var panel = $("explorer-panel");
    function show(id) {
      var d = D.dhammas.filter(function (x) { return x.id === id; })[0];
      Array.prototype.forEach.call(t.querySelectorAll("tbody tr"), function (r) { r.classList.toggle("on", r.getAttribute("data-id") === id); });
      if (!panel) return;
      if (!d) { panel.innerHTML = '<p class="small muted">Choose a row to see that dhamma on its own: its identity card, how to notice it, and the plates that teach it.</p>'; return; }
      panel.innerHTML = '<div class="ex-cols"><div>' + (d.card ? card(d) : '<p class="small">No single commentarial card: a citta is defined by the kind it is. Read its row across: one citta, seen through nine lists.</p>') + "</div>" +
        '<div class="ex-side"><div class="lab">Notice it</div><p class="small">' + d.notice + '</p><div class="lab">Read it across</div><p class="small">' + sentence(d) + '</p><div class="lab">Plates</div><p>' + d.p.map(xr).join(" ") + "</p></div></div>";
    }
    function sentence(d) {
      var REAL = { citta: "a citta, a kind of consciousness", cetasika: "a cetasika, a mental factor", "rūpa": "matter (rūpa)", "Nibbāna": "the fourth reality" };
      var TRUTH = { suffering: "the truth of suffering", origin: "the truth of the origin of suffering", cessation: "the truth of cessation",
        "suffering¹": "the truth of suffering (when it is mundane)", "suffering¹ · path": "the truth of suffering, or, as a factor of path consciousness, the truth of the path" };
      var who = d.id === "mk" ? "A great wholesome citta" : (d.real === "rūpa" ? "The " + d.en : d.en.charAt(0).toUpperCase() + d.en.slice(1));
      var s = who + " is " + REAL[d.real];
      s += d.agg === "none" ? ", in no aggregate" : ", in the aggregate of " + d.agg;
      s += ", the " + d.base + " base and the " + d.el + " element. ";
      s += "It belongs to " + TRUTH[d.truth] + ". ";
      s += d.kind === "varies" ? "Its quality and its place among causes and results follow the citta it arises with. " : "It is " + d.kind.replace("²", " or indeterminate") + ". ";
      s += d.root ? "It is one of the six roots. " : "";
      s += d.obj ? "It knows an object." : "It takes no object.";
      return s;
    }
    t.addEventListener("click", function (e) { var r = e.target.closest("tbody tr"); if (r) show(r.getAttribute("data-id")); });
    t.addEventListener("keydown", function (e) { var r = e.target.closest("tbody tr"); if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(r.getAttribute("data-id")); } });
    show("lobha");
  })();

  /* ---------------- identity cards ---------------- */
  (function () {
    var host = $("idcards-grid"); if (!host) return;
    host.innerHTML = D.dhammas.filter(function (d) { return d.card; }).map(function (d) { return card(d); }).join("");
  })();

  /* ---------------- review deck ---------------- */
  (function () {
    var list = $("deck-list");
    if (list) {
      list.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(function (lv) {
        return '<div class="dgrp"><div class="lab" style="color:var(--lv' + lv + ')">' + ROM[lv] + " · " + LV[lv].name + "</div><ol>" +
          D.deck.filter(function (c) { return c[0] === lv; }).map(function (c) { return "<li><b>" + c[1] + "</b> <span>" + c[2] + "</span></li>"; }).join("") + "</ol></div>";
      }).join("");
    }
    var INT = [0, 1, 3, 7, 14, 30];
    var lg = $("leitner-g");
    if (lg) {
      var g = "", W = 112, G = 22, X = function (b) { return 6 + (b - 1) * (W + G); };
      for (var b = 1; b <= 5; b++) {
        g += '<rect x="' + X(b) + '" y="14" width="' + W + '" height="34" rx="5" style="fill:color-mix(in srgb, var(--lv' + (b + 1) + ') ' + (8 + b * 6) + '%, var(--sheet));stroke:var(--lv' + (b + 1) + ')"/>';
        g += '<text x="' + (X(b) + 10) + '" y="30" class="tx-s tx-b">Box ' + b + "</text>";
        g += '<text x="' + (X(b) + 10) + '" y="42" class="tx-xs tx-mu">' + (b === 1 ? "every day" : "every " + INT[b] + " days") + "</text>";
        if (b < 5) g += '<path d="M' + (X(b) + W + 3) + " 31 L" + (X(b + 1) - 4) + ' 31" style="fill:none;stroke:var(--nib);stroke-width:1.6"/><path d="M' + (X(b + 1) - 9) + " 27 L" + (X(b + 1) - 4) + " 31 L" + (X(b + 1) - 9) + ' 35" style="fill:none;stroke:var(--nib);stroke-width:1.6"/>';
      }
      g += '<text x="' + (X(1) + W + 11) + '" y="10" text-anchor="middle" class="tx-xs" style="fill:var(--nib)">known: move up</text>';
      g += '<path d="M' + (X(5) + W / 2) + " 50 C" + (X(5) + W / 2) + " 60, " + (X(1) + W / 2) + " 60, " + (X(1) + W / 2) + ' 51" style="fill:none;stroke:var(--bad);stroke-width:1.3;stroke-dasharray:4 3"/>';
      g += '<text x="340" y="60" text-anchor="middle" class="tx-xs" style="fill:var(--bad);paint-order:stroke;stroke:var(--sheet);stroke-width:3px">missed: back to box 1</text>';
      lg.innerHTML = g;
    }
    var app = $("deck-app"); if (!app) return;
    var KEY = "abhidhamma-atlas:deck:v1";
    var st = load(KEY) || {}; st.c = st.c || {}; st.lv = st.lv || 1;
    function today() { return Math.floor(Date.now() / 86400000); }
    function box(i) { return (st.c[i] || [0, 0])[0]; }
    function due(i) { return (st.c[i] || [0, 0])[1]; }
    function inPlay() { return D.deck.map(function (c, i) { return c[0] <= st.lv ? i : -1; }).filter(function (i) { return i >= 0; }); }
    var queue = [], shown = false, practising = false;
    function build() {
      var t = today();
      queue = inPlay().filter(function (i) { return due(i) <= t; }).sort(function (a, b) { return box(a) - box(b) || a - b; });
      practising = false;
    }
    function render() {
      var lvb = $("deck-lv");
      lvb.innerHTML = '<span class="lab">Cards up to</span>' + [1, 2, 3, 4, 5, 6, 7].map(function (l) {
        return '<button type="button" class="pill" data-lv="' + l + '" aria-pressed="' + (l === st.lv) + '" title="Level ' + ROM[l] + ": " + LV[l].name + '">' + ROM[l] + "</button>";
      }).join("");
      var counts = [0, 0, 0, 0, 0, 0], ip = inPlay();
      ip.forEach(function (i) { counts[box(i)]++; });
      $("deck-boxes").innerHTML = counts.map(function (n, b) {
        return '<div class="dbox' + (b ? "" : " new") + '"><b>' + n + "</b><span>" + (b ? "box " + b + (b === 1 ? " · daily" : " · every " + INT[b] + " days") : "new") + "</span></div>";
      }).join("");
      var cardEl = $("deck-card");
      if (!queue.length) {
        var t = today(), next = ip.map(due).filter(function (d) { return d > t; }).sort(function (a, b) { return a - b; })[0];
        cardEl.innerHTML = '<div class="dq"><span class="lab">All done for today</span><p class="dqt">Nothing more is due' + (next ? ". The next card comes back in " + (next - t) + (next - t === 1 ? " day." : " days.") : ".") + '</p><div class="btnrow sm"><button type="button" class="pill" data-act="again">Practise all ' + ip.length + " cards now</button></div></div>";
        return;
      }
      var i = queue[0], c = D.deck[i];
      cardEl.innerHTML = '<div class="dq"><span class="lab">Level ' + ROM[c[0]] + " · " + (box(i) ? "box " + box(i) : "new card") + " · " + queue.length + (practising ? " in this practice" : " due today") + '</span><p class="dqt">' + c[1] + "</p>" +
        (shown ? '<p class="dqa">' + c[2] + '</p><div class="btnrow sm"><button type="button" class="pill" data-act="miss">Not yet</button><button type="button" class="pill" data-act="hit">I knew it</button></div>'
          : '<div class="btnrow sm"><button type="button" class="pill" data-act="show">Show the answer</button></div>') + "</div>";
    }
    app.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var lv = b.getAttribute("data-lv"), act = b.getAttribute("data-act");
      if (lv) { st.lv = +lv; save(KEY, st); build(); shown = false; render(); return; }
      if (act === "show") shown = true;
      else if (act === "hit" || act === "miss") {
        var i = queue.shift(), nb = act === "hit" ? Math.min(5, box(i) + 1) : 1;
        st.c[i] = [nb, today() + (act === "hit" ? INT[nb] : 0)];
        if (act === "miss") queue.push(i);
        save(KEY, st); shown = false;
      } else if (act === "again") { queue = inPlay().slice(); practising = true; shown = false; }
      else if (act === "reset") { $("deck-confirm").hidden = false; return; }
      else if (act === "reset-yes") { st = { c: {}, lv: st.lv }; save(KEY, st); $("deck-confirm").hidden = true; build(); shown = false; }
      else if (act === "reset-no") { $("deck-confirm").hidden = true; return; }
      else if (act === "list") { var l = $("deck-list"); l.hidden = !l.hidden; b.textContent = l.hidden ? "Show every question and answer" : "Hide the answers"; return; }
      render();
    });
    build(); render();
  })();
})();
