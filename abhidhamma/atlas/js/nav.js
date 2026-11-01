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
    '<a class="nb-toc" href="#cover" aria-label="Contents">Contents</a>';
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
  bar.querySelector(".nb-toc").addEventListener("click", function () { stack.push({ y: window.scrollY, i: currentIndex() }); });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, select, textarea")) return;
    if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); back.click(); }
  });
  var t = null;
  window.addEventListener("scroll", function () { if (!t) t = setTimeout(function () { t = null; update(); }, 120); }, { passive: true });
  update();
})();
