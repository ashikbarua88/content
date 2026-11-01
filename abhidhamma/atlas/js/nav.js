/* Abhidhamma Atlas: on-screen navigation.
   A small bar that shows which sheet you are on, takes you Back to where you were before
   following a link, and steps to the previous or next sheet in reading order. Screen only. */
(function () {
  "use strict";
  var sheets = Array.prototype.slice.call(document.querySelectorAll("section.sheet"));
  if (!sheets.length) return;
  function title(sec) {
    var b = sec.querySelector(".ph b"), h = sec.querySelector("h2");
    return (b ? b.textContent : "") + (h ? " · " + h.textContent : "");
  }
  var bar = document.createElement("nav");
  bar.className = "navbar web";
  bar.setAttribute("aria-label", "Atlas navigation");
  bar.innerHTML = '<button type="button" class="nb-back" disabled aria-label="Back to where you were">← Back</button>' +
    '<button type="button" class="nb-prev" aria-label="Previous sheet">‹</button>' +
    '<span class="nb-here" aria-live="polite"></span>' +
    '<button type="button" class="nb-next" aria-label="Next sheet">›</button>' +
    '<button type="button" class="nb-toc" aria-expanded="false" aria-controls="nb-panel">Contents</button>';
  document.body.appendChild(bar);
  var here = bar.querySelector(".nb-here"), back = bar.querySelector(".nb-back"), stack = [], cur = 0;

  function currentIndex() {
    var mid = window.innerHeight * 0.35, best = 0;
    sheets.forEach(function (s, i) { if (s.getBoundingClientRect().top <= mid) best = i; });
    return best;
  }
  function update() {
    cur = currentIndex();
    here.textContent = title(sheets[cur]) + "  ·  " + (cur + 1) + " / " + sheets.length;
    back.disabled = !stack.length;
    back.title = stack.length ? "Back to " + title(sheets[stack[stack.length - 1].i]) : "";
  }
  function go(i) { sheets[Math.max(0, Math.min(sheets.length - 1, i))].scrollIntoView({ block: "start" }); }

  /* remember where you were before following any in-page link */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.closest(".navbar")) return;
    stack.push({ y: window.scrollY, i: currentIndex() });
    if (stack.length > 50) stack.shift();
    setTimeout(update, 60);
  }, true);
  back.addEventListener("click", function () {
    var p = stack.pop(); if (!p) return;
    window.scrollTo(0, p.y); setTimeout(update, 60);
  });
  bar.querySelector(".nb-prev").addEventListener("click", function () { go(currentIndex() - 1); });
  bar.querySelector(".nb-next").addEventListener("click", function () { go(currentIndex() + 1); });
  /* floating table of contents */
  var panel = document.createElement("div");
  panel.className = "nb-panel web"; panel.id = "nb-panel"; panel.hidden = true;
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Contents");
  panel.innerHTML = '<div class="nb-ph"><b>Contents</b><button type="button" class="nb-close" aria-label="Close contents">×</button></div><ol>' + sheets.map(function (sec, i) {
    var head = /^L\d$/.test(sec.id) || sec.id === "cover" || sec.id === "explorer";
    return '<li class="' + (head ? "h" : "") + '"><button type="button" data-i="' + i + '"><span>' + title(sec) + "</span><em>" + (i + 1) + "</em></button></li>";
  }).join("") + "</ol>";
  document.body.appendChild(panel);
  var tocBtn = bar.querySelector(".nb-toc");
  function openToc(open) {
    panel.hidden = !open; tocBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      var c = currentIndex();
      Array.prototype.forEach.call(panel.querySelectorAll("li button"), function (b) { b.classList.toggle("cur", +b.getAttribute("data-i") === c); });
      var cb = panel.querySelector("button.cur"); if (cb) { cb.scrollIntoView({ block: "center" }); cb.focus({ preventScroll: true }); }
    } else tocBtn.focus({ preventScroll: true });
  }
  tocBtn.addEventListener("click", function () { openToc(panel.hidden); });
  panel.addEventListener("click", function (e) {
    if (e.target.closest(".nb-close")) { openToc(false); return; }
    var b = e.target.closest("li button"); if (!b) return;
    stack.push({ y: window.scrollY, i: currentIndex() });
    openToc(false); go(+b.getAttribute("data-i")); setTimeout(update, 60);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) openToc(false); });
  document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !bar.contains(e.target)) openToc(false); });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, select, textarea")) return;
    if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); back.click(); }
  });
  var t = null;
  window.addEventListener("scroll", function () { if (!t) t = setTimeout(function () { t = null; update(); }, 120); }, { passive: true });
  update();
})();
