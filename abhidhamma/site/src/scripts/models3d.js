/* The 3D models, brought over from the atlas (atlas/js/models3d.js) and now kept here: the site
   owns them. three.js r128 is loaded by src/scripts/three-models.js, which sets window.THREE first. */
(function () {
  "use strict";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888888"; }
  function $(id) { return document.getElementById(id); }
  var HAS3 = !!window.THREE && (function () { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; } })();
  var NOGL = '<div class="nogl">This model needs WebGL, which this browser is not providing. The captions and the 2D plates cover the same content.</div>';
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var R3 = null, scenes = [], rethemers = [];
  function renderer() {
    if (!R3) { R3 = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R3.setPixelRatio(1); R3.setSize(1400, 1300, false); }
    return R3;
  }

  /* ---------------- toolkit ----------------
     make3D options: cam/look/fov set the viewing direction; with fit:true the distance and a sideways
     pan are solved so the model AND its labels fill the canvas at any aspect (phone, desktop, A4).
     height / phoneRatio / heightFn size the canvas on screen, printHeight in print.
     declutter:true hides the lower-priority of two overlapping labels (label(..., {pri})).
     printSearch: [y-offsets] lets __render3dAll pick the print angle with the fewest label overlaps. */
  function isPrint() { return !!window.__print3d || !!(window.matchMedia && matchMedia("print").matches); }
  function make3D(id, o) {
    var host = $(id); if (!host) return null;
    if (!HAS3) { host.insertAdjacentHTML("afterbegin", NOGL); return null; }
    var cv = document.createElement("canvas"); cv.className = "c3"; host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext("2d");
    var overlay = document.createElement("div"); overlay.className = "labels"; host.appendChild(overlay);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(o.fov || 36, 1.5, 0.1, 200);
    var look = new THREE.Vector3(o.look[0], o.look[1], o.look[2]);
    var camBase = new THREE.Vector3(o.cam[0], o.cam[1], o.cam[2]).sub(look), refA = o.refAspect || 1.4;
    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    var d1 = new THREE.DirectionalLight(0xffffff, 0.78); d1.position.set(3, 6, 7); scene.add(d1);
    var d2 = new THREE.DirectionalLight(0xffffff, 0.25); d2.position.set(-5, -2, -4); scene.add(d2);
    var root = new THREE.Group(); scene.add(root);
    var S = { host: host, cv: cv, ctx: ctx, scene: scene, camera: camera, root: root, overlay: overlay, labels: [], visible: true, update: null,
      touched: false, sway: o.sway || 0, spin: o.spin || 0, baseY: o.rotY || 0, baseX: o.rotX || 0, t: 0, dirty: true, w: 0, h: 0,
      look: look, camBase: camBase, fit: !!o.fit, pad: o.pad != null ? o.pad : 0.035, zoom: o.zoom || 1, declutter: !!o.declutter,
      printSearch: o.printSearch || null, needFit: true, onSize: null };
    root.rotation.set(S.baseX, S.baseY, 0);
    S.size = function () {
      var w = host.clientWidth || 640, h = isPrint() && o.printHeight ? o.printHeight : o.heightFn ? o.heightFn(w) : (w < 560 ? Math.round(w * (o.phoneRatio || 0.9)) : o.height);
      if (w === S.w && h === S.h) return;
      S.w = w; S.h = h;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (!S.fit) { var f = Math.max(1, refA / (w / h)); camera.position.copy(look).add(camBase.clone().multiplyScalar(f)); camera.lookAt(look); }
      S.needFit = true; S.dirty = true;
    };
    S.refit = function () { S.needFit = true; S.dirty = true; };
    S.size();
    var drag = false, px = 0, py = 0;
    cv.style.touchAction = "pan-y";
    cv.addEventListener("pointerdown", function (e) { drag = true; S.touched = true; px = e.clientX; py = e.clientY; S.downX = e.clientX; S.downY = e.clientY; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      root.rotation.y += (e.clientX - px) * 0.008;
      root.rotation.x = Math.max(-1.0, Math.min(1.0, root.rotation.x + (e.clientY - py) * 0.006));
      px = e.clientX; py = e.clientY; S.dirty = true;
    });
    cv.addEventListener("pointerup", function (e) {
      drag = false;
      if (S.onClick && Math.abs(e.clientX - S.downX) < 5 && Math.abs(e.clientY - S.downY) < 5) S.onClick(e);
    });
    cv.addEventListener("pointercancel", function () { drag = false; });
    S.isDragging = function () { return drag; };
    S.pick = function (e, objs) {
      var r = cv.getBoundingClientRect(), m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      var ray = new THREE.Raycaster(); ray.setFromCamera(m, camera);
      var hits = ray.intersectObjects(objs, false); return hits.length ? hits[0].object : null;
    };
    if (window.ResizeObserver) new ResizeObserver(function () { S.size(); }).observe(host);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { es.forEach(function (en) { S.visible = en.isIntersecting; if (en.isIntersecting) S.dirty = true; }); }, { rootMargin: "150px" }).observe(host);
    scenes.push(S);
    return S;
  }
  function anchor(S, x, y, z, parent) { var a = new THREE.Object3D(); a.position.set(x, y, z); (parent || S.root).add(a); return a; }
  /* opt: pri (declutter priority, higher wins), nofit (camera fit ignores it), minW (hidden below this canvas width),
     short (text used below 560 px). */
  function label(S, html, obj, cls, opt) {
    var el = document.createElement("span"); el.className = "lbl3 " + (cls || ""); el.innerHTML = html; S.overlay.appendChild(el);
    var L = { el: el, obj: obj, alpha: 1, hidden: false, html: html, w: null, h: null };
    if (opt) for (var k in opt) L[k] = opt[k];
    S.labels.push(L); return L;
  }
  function relabel(L, html) { if (L.el.innerHTML !== html) { L.el.innerHTML = html; L.w = null; } }
  function shortLabels(S) { S.labels.forEach(function (L) { if (L.short) relabel(L, S.w < 560 ? L.short : L.html); }); }

  /* Solve camera distance and pan so every mesh box corner and every label (with its pixel size) fits the canvas.
     Spinning models are fitted over a full turn, swaying ones over their swing. */
  function fitCamera(S) {
    var cam = S.camera, dir = S.camBase.clone().normalize();
    var r = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize(), u = new THREE.Vector3().crossVectors(dir, r);
    var keep = S.root.rotation.clone(); S.root.rotation.set(0, 0, 0); S.root.updateMatrixWorld(true);
    var pts = [], bx = new THREE.Box3(), W = S.w, H = S.h;
    S.root.traverse(function (m) {
      if (m === S.root || !m.geometry) return;
      for (var p = m; p && p !== S.root; p = p.parent) if (p.userData.nofit) return;
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      bx.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
      for (var i = 0; i < 8; i++) pts.push({ p: V(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z), l: 0, rr: 0, t: 0, b: 0 });
    });
    S.labels.forEach(function (L) {
      if (L.nofit || (L.minW && W < L.minW)) return;
      for (var p = L.obj; p && p !== S.root; p = p.parent) if (p.userData && p.userData.nofit) return;
      var w = L.el.offsetWidth, h = L.el.offsetHeight, c = L.el.classList, pw = new THREE.Vector3(); L.obj.getWorldPosition(pw);
      var lw = c.contains("left") ? w : c.contains("right") ? 0 : w / 2;
      pts.push({ p: pw, l: 2 * lw / W, rr: 2 * (w - lw) / W, t: h / H, b: h / H });
    });
    S.root.rotation.copy(keep); S.root.updateMatrixWorld(true);
    var rots = [];
    if (isPrint() || window.__freeze3d) rots.push(S.baseY + (S.printY || 0));
    else if (S.spin) for (var k = 0; k < 12; k++) rots.push(k * Math.PI / 6);
    else if (S.sway) rots.push(S.baseY - S.sway, S.baseY - S.sway / 2, S.baseY, S.baseY + S.sway / 2, S.baseY + S.sway);
    else rots.push(S.baseY);
    var tv = Math.tan(cam.fov * Math.PI / 360), th = tv * cam.aspect, pad = S.pad, M = new THREE.Matrix4(), E = new THREE.Euler();
    var Q = [];
    rots.forEach(function (ry) {
      M.makeRotationFromEuler(E.set(S.baseX, ry, 0));
      pts.forEach(function (P) { Q.push({ q: P.p.clone().applyMatrix4(M).sub(S.look), P: P }); });
    });
    var pan = V(0, 0, 0), d = S.camBase.length();
    function solve() {
      var need = 0.5;
      Q.forEach(function (o) {
        var q = o.q.clone().sub(pan), x = q.dot(r), y = q.dot(u), z = q.dot(dir), P = o.P;
        var ax = x >= 0 ? th * Math.max(0.08, 1 - pad - P.rr) : th * Math.max(0.08, 1 - pad - P.l);
        var ay = y >= 0 ? tv * Math.max(0.08, 1 - pad - P.t) : tv * Math.max(0.08, 1 - pad - P.b);
        need = Math.max(need, z + Math.abs(x) / ax, z + Math.abs(y) / ay, z + 0.6);
      });
      return need;
    }
    for (var it = 0; it < 5; it++) {
      d = solve();
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      Q.forEach(function (o) {
        var q = o.q.clone().sub(pan), D = d - q.dot(dir), X = q.dot(r) / (D * th), Y = q.dot(u) / (D * tv);
        x0 = Math.min(x0, X - o.P.l); x1 = Math.max(x1, X + o.P.rr); y0 = Math.min(y0, Y - o.P.b); y1 = Math.max(y1, Y + o.P.t);
      });
      pan.add(r.clone().multiplyScalar((x0 + x1) / 2 * d * th)).add(u.clone().multiplyScalar((y0 + y1) / 2 * d * tv));
    }
    d = solve() / S.zoom;
    var tgt = S.look.clone().add(pan);
    cam.position.copy(tgt).add(dir.multiplyScalar(d)); cam.lookAt(tgt); cam.updateMatrixWorld(true);
  }
  function overlapScore(S) {
    var rs = [];
    S.labels.forEach(function (L) {
      if (L.hidden || L.alpha < 0.5 || (L.minW && S.w < L.minW)) return;
      L.obj.getWorldPosition(tmpV); tmpV.project(S.camera);
      var x = (tmpV.x * 0.5 + 0.5) * S.w, y = (-tmpV.y * 0.5 + 0.5) * S.h, w = L.el.offsetWidth, h = L.el.offsetHeight, c = L.el.classList;
      var x0 = x - (c.contains("left") ? w : c.contains("right") ? 0 : w / 2);
      rs.push([x0, y - h / 2, x0 + w, y + h / 2, L.pri || 0]);
    });
    var s = 0;
    for (var i = 0; i < rs.length; i++) for (var j = i + 1; j < rs.length; j++) {
      var ix = Math.min(rs[i][2], rs[j][2]) - Math.max(rs[i][0], rs[j][0]), iy = Math.min(rs[i][3], rs[j][3]) - Math.max(rs[i][1], rs[j][1]);
      if (ix > 0 && iy > 0) s += ix * iy * (1 + Math.min(rs[i][4], rs[j][4]));
    }
    return s;
  }
  function col(v) { return new THREE.Color(tok(v)); }
  function stdMat(v, opt) {
    opt = opt || {};
    var m = new THREE.MeshStandardMaterial({ color: col(v), roughness: 0.5, metalness: 0.05, emissive: col(v), emissiveIntensity: opt.glow != null ? opt.glow : 0.16,
      transparent: opt.opacity != null, opacity: opt.opacity != null ? opt.opacity : 1, depthWrite: opt.opacity == null || opt.opacity > 0.6 });
    rethemers.push(function () { m.color.set(tok(v)); m.emissive.set(tok(v)); });
    return m;
  }
  function basicMat(v, opacity, wire) {
    var m = new THREE.MeshBasicMaterial({ color: col(v), transparent: true, opacity: opacity, depthWrite: opacity > 0.6, wireframe: !!wire });
    rethemers.push(function () { m.color.set(tok(v)); });
    return m;
  }
  function lineMat(v, opacity) {
    var m = new THREE.LineBasicMaterial({ color: col(v), transparent: true, opacity: opacity });
    rethemers.push(function () { m.color.set(tok(v)); });
    return m;
  }
  function tube(points, r, mat, closed) {
    var curve = points.length === 3 && !closed ? new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]) : new THREE.CatmullRomCurve3(points, !!closed);
    var m = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, r, 8, !!closed), mat); m.userData.curve = curve; return m;
  }
  function V(x, y, z) { return new THREE.Vector3(x, y, z); }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function pills(host, items, cur, onPick) {
    if (!host) return;
    host.innerHTML = items.map(function (it) {
      return '<button type="button" class="pill" data-v="' + it.id + '" aria-pressed="' + (it.id === cur) + '">' + (it.c ? '<i style="background:var(' + it.c + ')"></i>' : "") + it.label + "</button>";
    }).join("");
    host.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      Array.prototype.forEach.call(host.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      onPick(b.getAttribute("data-v"));
    });
  }
  /* A tooltip card inside a scene's host: show(ev, html) places it beside the pointer, kept inside the canvas. */
  function tipCard(S, el) {
    if (!el) return { show: function () {}, hide: function () {} };
    return {
      show: function (ev, html) {
        if (el.innerHTML !== html) el.innerHTML = html;
        var r = S.cv.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
        if (x + w > r.width - 4) x = Math.max(4, ev.clientX - r.left - w - 14);
        if (y + h > r.height - 4) y = Math.max(4, ev.clientY - r.top - h - 14);
        el.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)"; el.classList.add("on");
      },
      hide: function () { el.classList.remove("on"); }
    };
  }
  /* A cone arrowhead whose tip sits at p, pointing along the unit tangent t. */
  var UP = HAS3 ? new THREE.Vector3(0, 1, 0) : null;
  function arrow(p, t, mat, r, h) {
    var c = new THREE.Mesh(new THREE.ConeGeometry(r || 0.075, h || 0.2, 14), mat);
    c.position.copy(p).sub(t.clone().multiplyScalar((h || 0.2) / 2)); c.quaternion.setFromUnitVectors(UP, t); return c;
  }
  function esc3(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function jsonData(id) { var el = $(id); try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; } }

  function setPressed(host, v) { if (host) Array.prototype.forEach.call(host.children, function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-v") === v)); }); }

  var tmpV = HAS3 ? new THREE.Vector3() : null;
  function prepare(S) {
    if (!S.needFit) return;
    S.needFit = false;
    shortLabels(S); if (S.onSize) S.onSize(S.w, S.h); if (S.beforeFit) S.beforeFit();
    S.labels.forEach(function (L) { L.w = null; });
    if (S.fit) fitCamera(S);
  }
  function draw(S) {
    prepare(S);
    var r = renderer(), W = S.cv.width, H = S.cv.height, c = r.domElement;
    if (c.width < W || c.height < H) r.setSize(Math.max(c.width, W), Math.max(c.height, H), false);
    r.setViewport(0, 0, W, H); r.setScissor(0, 0, W, H); r.setScissorTest(true);
    r.setClearColor(0x000000, 0); r.clear();
    r.render(S.scene, S.camera);
    S.ctx.clearRect(0, 0, W, H);
    S.ctx.drawImage(c, 0, c.height - H, W, H, 0, 0, W, H);
    var placed = S.declutter ? [] : null, list = S.labels;
    if (placed) list = S.labels.map(function (L, i) { return [L, (L.alpha >= 0.5 ? 1000 : 0) + (L.pri || 0), i]; })
      .sort(function (a, b) { return b[1] - a[1] || a[2] - b[2]; }).map(function (a) { return a[0]; });
    list.forEach(function (L) {
      L.obj.getWorldPosition(tmpV); tmpV.project(S.camera);
      var x = (tmpV.x * 0.5 + 0.5) * S.w, y = (-tmpV.y * 0.5 + 0.5) * S.h, cl = L.el.classList;
      var shift = cl.contains("left") ? "-100%" : (cl.contains("right") ? "0%" : "-50%");
      var off = L.hidden || tmpV.z > 1 || (L.minW && S.w < L.minW);
      if (placed && !off) {
        if (L.w == null) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
        var x0 = x - (shift === "-100%" ? L.w : shift === "0%" ? 0 : L.w / 2), b = [x0 + 1.5, y - L.h / 2 + 1.5, x0 + L.w - 1.5, y + L.h / 2 - 1.5];
        if (placed.some(function (p) { return b[0] < p[2] && p[0] < b[2] && b[1] < p[3] && p[1] < b[3]; })) off = true; else placed.push(b);
      }
      L.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(" + shift + ",-50%)";
      L.el.style.opacity = off ? 0 : L.alpha;
    });
  }
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var anim = !RM && !window.__freeze3d;
    scenes.forEach(function (S) {
      if (!S.visible) return;
      if (anim) {
        S.t += dt;
        if (!S.touched) {
          if (S.sway) S.root.rotation.y = S.baseY + S.sway * Math.sin(S.t * 0.35);
          if (S.spin) S.root.rotation.y += S.spin * dt;
        }
        if (S.update) S.update(dt, S.t);
        draw(S);
      } else if (S.dirty) {
        if (S.update) S.update(0, S.t);
        draw(S); S.dirty = false;
      }
    });
    requestAnimationFrame(loop);
  }
  window.__render3dAll = function () {
    window.__freeze3d = true;
    scenes.forEach(function (S) {
      S.w = 0; S.size();
      if (S.beforePrint) S.beforePrint();
      if (S.update) S.update(0, S.t);
      if (S.printSearch) {
        var best = null;
        S.printSearch.forEach(function (py) {
          S.printY = py; S.root.rotation.set(S.baseX, S.baseY + py, 0); S.root.updateMatrixWorld(true);
          S.needFit = true; prepare(S);
          var sc = overlapScore(S); if (!best || sc < best[1] - 1) best = [py, sc];
        });
        S.printY = best[0];
      }
      S.root.rotation.set(S.baseX, S.baseY + (S.printY || 0), 0);
      S.needFit = true;
      draw(S);
    });
    return scenes.length;
  };
  /* Printing from the browser: draw every model at its print size first, then return to the screen. */
  window.addEventListener("beforeprint", function () { window.__print3d = true; window.__render3dAll(); });
  window.addEventListener("afterprint", function () {
    window.__print3d = false; window.__freeze3d = false;
    scenes.forEach(function (S) { S.w = 0; S.size(); });
  });
  function retheme() { setTimeout(function () { rethemers.forEach(function (f) { f(); }); scenes.forEach(function (S) { S.dirty = true; }); }, 30); }
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", retheme); }
  if (window.MutationObserver) new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ================= 1. Interconnection map =================
     Ideas, links and loops come from data.js. The 2D map (maps.js) sends "atlas:select"
     events, so choosing an idea or tracing a path there lights the same thing up here. */
  function xr() { return ""; } // plate cross-references belong to the atlas
  (function () {
    if (!document.getElementById("m3-view") || !window.ATLAS) return;
    var D = window.ATLAS, IDEAS = D.ideas, LINKS = D.links, LTYPE = D.linkTypes, LOOPS = D.loops;
    var byId = {}; IDEAS.forEach(function (n) { byId[n.id] = n; });
    /* Fitted camera; floors 1.45 apart so a back node's label clears the floor above's front node; labels
       sit on the outward side of their node; print picks the turn with the fewest label overlaps. */
    var S = make3D("m3-view", { height: 470, printHeight: 560, cam: [0, 2.2, 14.6], look: [0, 0.2, 0], fov: 36, sway: 0.5, rotX: 0.05, phoneRatio: 1.05,
      fit: true, declutter: true, printSearch: [-0.5, -0.35, -0.2, -0.1, 0, 0.1, 0.2, 0.35, 0.5] });
    if (!S) return;
    var Y = { 1: -3.6, 2: -2.15, 3: -0.7, 4: 0.75, 5: 2.2, 6: 3.65 }, RAD = 2.9;
    for (var lv = 2; lv <= 6; lv++) {
      var disc = new THREE.Mesh(new THREE.CircleGeometry(RAD + 0.4, 64), basicMat("--lv" + lv, 0.07)); disc.rotation.x = -Math.PI / 2; disc.position.y = Y[lv] - 0.02; S.root.add(disc);
      var rim = new THREE.Mesh(new THREE.TorusGeometry(RAD + 0.4, 0.008, 6, 120), basicMat("--lv" + lv, 0.45)); rim.rotation.x = Math.PI / 2; rim.position.y = Y[lv] - 0.02; S.root.add(rim);
      label(S, ["", "I", "II", "III", "IV", "V", "VI"][lv], anchor(S, RAD + 0.75, Y[lv], 0), "sm", { pri: 1 });
    }
    var base = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), basicMat("--lv1", 0.12)); base.rotation.x = -Math.PI / 2; base.position.y = Y[1] - 0.02; S.root.add(base);
    label(S, "I", anchor(S, 1.1, Y[1], 0), "sm", { pri: 1 });
    var meshes = [], pos = {}, labs = {};
    IDEAS.forEach(function (n) {
      var r = n.orbit === null ? 0 : RAD, a = (n.orbit || 0) * Math.PI / 180;
      var p = V(r * Math.cos(a), Y[n.lv], r * Math.sin(a)); pos[n.id] = p;
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.24, 28, 20), stdMat(n.c, { glow: 0.3 })); m.position.copy(p); m.userData.id = n.id; S.root.add(m); meshes.push(m);
      labs[n.id] = label(S, n.t, anchor(S, p.x * 1.06, p.y + 0.4, p.z * 1.06), "nd", { pri: 5 });
    });
    var edges = LINKS.map(function (l, i) {
      var a = pos[l.from], b = pos[l.to], mid = a.clone().add(b).multiplyScalar(0.5);
      var out = V(mid.x, 0, mid.z); if (out.length() < 0.1) out = V(1, 0, 0);
      out.normalize().multiplyScalar(0.9 + a.distanceTo(b) * 0.12); mid.add(out); mid.y += 0.25;
      var mat = basicMat(LTYPE[l.type][0], 0.55);
      var t = tube([a, mid, b], 0.024, mat); S.root.add(t);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 10), mat);
      var c = t.userData.curve, end = c.getPoint(0.86), dir = c.getTangent(0.86);
      cone.position.copy(end); cone.quaternion.setFromUnitVectors(V(0, 1, 0), dir); S.root.add(cone);
      var L = label(S, l.label, anchor(S, c.getPoint(0.5).x, c.getPoint(0.5).y, c.getPoint(0.5).z), "sm el", { pri: 3, nofit: true }); L.hidden = true;
      return { l: l, i: i, mat: mat, L: L };
    });
    var st = { idea: null, loop: null, path: null };
    function edgeOn(e) {
      if (st.path) return st.path.indexOf(e.i) >= 0;
      if (st.idea) return e.l.from === st.idea || e.l.to === st.idea;
      if (st.loop) return LOOPS[st.loop].some(function (p) { return p[0] === e.l.from && p[1] === e.l.to; });
      return null;
    }
    var LOOPTEXT = {
      life: "<b>The loop of a life.</b> Kamma ripens as rebirth; the rebirth citta continues as the life-continuum; objects interrupt it; processes peak in javanas; their volition is new kamma.",
      mm: "<b>Mind and matter.</b> Matter gives mind its bases and objects; mind produces matter; kamma builds the body's organs.",
      way: "<b>The way out.</b> Calm supports insight; insight matures into path; the path takes Nibbāna as object and cuts the roots of the wheel."
    };
    function apply() {
      var lit = {}, any = st.idea || st.loop || st.path;
      edges.forEach(function (e) {
        var on = edgeOn(e);
        e.mat.opacity = on === null ? 0.55 : (on ? 0.95 : 0.08);
        e.L.hidden = !on;
        if (on) { lit[e.l.from] = 1; lit[e.l.to] = 1; }
      });
      if (st.idea) lit[st.idea] = 1;
      IDEAS.forEach(function (n) { labs[n.id].alpha = !any || lit[n.id] ? 1 : 0.3; });
      var cap = $("m3-sel");
      if (cap) {
        if (st.path) {
          cap.innerHTML = "<b>Path:</b> " + st.path.map(function (i, k) { var l = LINKS[i]; return (k ? "" : byId[l.from].t + " ") + "<i>" + l.label + "</i> → " + byId[l.to].t; }).join(", then ") + ".";
        } else if (st.idea) {
          var n = byId[st.idea];
          var outs = LINKS.filter(function (l) { return l.from === n.id; }).map(function (l) { return l.label + " → " + byId[l.to].t; });
          var ins = LINKS.filter(function (l) { return l.to === n.id; }).map(function (l) { return byId[l.from].t + " → " + l.label; });
          cap.innerHTML = "<b>" + n.t + ".</b> " + n.d + (ins.length ? " <b>From:</b> " + ins.join("; ") + "." : "") + (outs.length ? " <b>To:</b> " + outs.join("; ") + "." : "") +
            " " + n.p.map(xr).join(" ") + ' <a class="xr" href="#idea-' + n.id + '">on the 2D map</a>';
        } else if (st.loop) cap.innerHTML = LOOPTEXT[st.loop];
        else cap.innerHTML = "Selected: none. Choose an idea in the model, or a loop above. The 2D map has the same ideas, each with its own panel of links.";
      }
      S.dirty = true;
    }
    pills($("m3-btns"), [{ id: "all", label: "All links" }, { id: "life", label: "Loop of a life", c: "--kamma" }, { id: "mm", label: "Mind and matter", c: "--rupa-mark" }, { id: "way", label: "The way out", c: "--nib" }], "all",
      function (v) { st = { idea: null, loop: v === "all" ? null : v, path: null }; apply(); });
    S.onClick = function (e) {
      var o = S.pick(e, meshes); if (!o) return;
      st = { idea: st.idea === o.userData.id ? null : o.userData.id, loop: null, path: null };
      setPressed($("m3-btns"), "all"); apply();
    };
    document.addEventListener("atlas:select", function (ev) {
      var d = ev.detail || {};
      st = { idea: d.idea || null, loop: d.loop || null, path: d.path || null };
      setPressed($("m3-btns"), st.loop || "all"); apply();
    });
    apply();
  })();

  /* ================= 2. D1: categories =================
     Items take the colour of the reality they are made of (one column: that column's colour; several: neutral),
     except the truths, which keep their meaning colours (origin red, path and cessation teal). */
  (function () {
    var S = make3D("d1-view", { height: 470, printHeight: 500, cam: [0, 7.4, 9.4], look: [0.1, 2.1, 0], fov: 36, sway: 0.28, rotX: 0.02, phoneRatio: 1.0, fit: true, declutter: true });
    var PIL = { ci: [-3.0, 1.5, "--nama", "citta · 89"], ce: [-1.25, 1.5, "--nama-2", "cetasika · 52"], ru: [1.0, 2.5, "--rupa-mark", "rūpa · 28"], nb: [3.05, 1.0, "--nib", "Nibbāna · 1"] };
    var SH = [["agg", 0.9, "5 aggregates"], ["bas", 1.95, "12 bases"], ["ele", 3.0, "18 elements"], ["tru", 4.05, "4 noble truths"]];
    var ZR = { f: 0.64, m: 0, b: -0.64 };
    var RU = ["eye", "ear", "nose", "tongue", "body"], OB = ["form", "sound", "smell", "taste", "touch"];
    /* [shelf, columns, row, label, small-index, colour override, label column] */
    var T = [
      ["agg", ["ru"], "f", "rūpa"], ["agg", ["ce"], "f", "feeling"], ["agg", ["ce"], "m", "perception"], ["agg", ["ce"], "b", "formations"], ["agg", ["ci"], "f", "consciousness"],
      ["bas", ["ci"], "f", "mind base"], ["bas", ["ce", "ru", "nb"], "b", "mental-object base"],
      ["ele", ["ci"], "f", "5 sense-consc. · 10"], ["ele", ["ci"], "m", "mind el. · 3"], ["ele", ["ci"], "b", "mind-consc. el. · 76"], ["ele", ["ce", "ru", "nb"], "b", "mental-object element"],
      ["tru", ["ci", "ce", "ru"], "f", "suffering · all that is mundane", null, "--muted", "ci"], ["tru", ["ce"], "m", "origin · craving", null, "--bad"], ["tru", ["ce"], "b", "path · the path factors", null, "--nib"], ["tru", ["nb"], "f", "cessation", null, "--nib"]
    ];
    ["bas", "ele"].forEach(function (sh) {
      RU.forEach(function (n, i) { T.push([sh, ["ru"], "f", n, i]); });
      OB.forEach(function (n, i) { T.push([sh, ["ru"], "m", n, i]); });
    });
    var cur = "all";
    pills($("d1-btns"), [{ id: "all", label: "All four lists" }].concat(SH.map(function (s) { return { id: s[0], label: s[2] }; })), cur, function (v) { cur = v; apply(); });
    if (!S) return;
    var objs = [], mats = {};
    function mat(c, on) { var k = c + on; if (!mats[k]) mats[k] = on ? stdMat(c, { glow: 0.3, opacity: 0.92 }) : basicMat(c, 0.1); return mats[k]; }
    Object.keys(PIL).forEach(function (k) {
      var p = PIL[k];
      var glass = new THREE.Mesh(new THREE.BoxGeometry(p[1], 4.5, 1.9), basicMat(p[2], 0.07)); glass.position.set(p[0], 2.25, 0); S.root.add(glass);
      var edgesM = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(p[1], 4.5, 1.9)), lineMat(p[2], 0.35)); edgesM.position.copy(glass.position); S.root.add(edgesM);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(p[1], 0.45, 1.9), stdMat(p[2], { glow: 0.3 })); foot.position.set(p[0], -0.22, 0); S.root.add(foot);
      label(S, p[3], anchor(S, p[0], -0.7, 1.0), "p", { pri: 9 });
    });
    SH.forEach(function (sh) {
      var plate = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.02, 2.0), basicMat("--g6", 0.06)); plate.position.set(0.2, sh[1] - 0.14, 0); S.root.add(plate);
      label(S, sh[2], anchor(S, -3.95, sh[1], 1.0), "sm left", { pri: 9 });
    });
    T.forEach(function (t) {
      var sh = SH.filter(function (s) { return s[0] === t[0]; })[0];
      var left = Infinity, right = -Infinity;
      t[1].forEach(function (k) { var p = PIL[k]; left = Math.min(left, p[0] - p[1] / 2); right = Math.max(right, p[0] + p[1] / 2); });
      var x0 = left + 0.08, x1 = right - 0.08, w;
      if (t[4] != null) { var cw = (x1 - x0) / 5; w = cw - 0.06; x0 = x0 + t[4] * cw + 0.03; x1 = x0 + w; } else w = x1 - x0;
      var c = t[5] || (t[1].length > 1 ? "--g6" : PIL[t[1][0]][2]);
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 0.42), mat(c, true));
      m.position.set((x0 + x1) / 2, sh[1], ZR[t[2]]); m.userData = { sh: t[0], c: c }; S.root.add(m); objs.push(m);
      var lx = t[6] ? PIL[t[6]][0] : (x0 + x1) / 2;
      var L = label(S, t[3], anchor(S, lx, sh[1] + 0.2, ZR[t[2]] + 0.2), t[4] != null ? "xs" : "sm2", { pri: t[4] != null ? 2 : 5 });
      m.userData.L = L;
    });
    function apply() {
      objs.forEach(function (m) {
        var on = cur === "all" || cur === m.userData.sh;
        m.material = mat(m.userData.c, on);
        m.userData.L.alpha = on ? 1 : 0.15;
      });
      S.dirty = true;
    }
    apply();
  })();

  /* ================= 3. D2: stupa of cittas ================= */
  var FEEL = { J: "--f-joy", E: "--f-eq", S: "--f-ple", P: "--f-pain", D: "--f-dis", V: "--f-joy" };
  (function () {
    var tiers = [
      { r: 2.7, y: 0, n: "54 sense-sphere", f: "JJJJEEEEDDEE" + "EEEEPEE" + "EEEESEJE" + "EEJ" + "JJJJEEEE" + "JJJJEEEE" + "JJJJEEEE",
        k: "BBBBBBBBBBBB" + "RRRRRRR" + "RRRRRRRR" + "FFF" + "GGGGGGGG" + "RRRRRRRR" + "FFFFFFFF" },
      { r: 2.0, y: 0.95, n: "15 fine-material", f: "JJJJEJJJJEJJJJE", k: "GGGGGRRRRRFFFFF" },
      { r: 1.35, y: 1.8, n: "12 immaterial", f: "EEEEEEEEEEEE", k: "GGGGRRRRFFFF" },
      { r: 0.75, y: 2.55, n: "8 supramundane", f: "VVVVVVVV", k: "PPPPQQQQ" }
    ];
    var KC = { B: "--bad", G: "--nama", R: "--nama-2", F: "--muted", P: "--nib", Q: "--nib" };
    /* The legend prints with the default colouring, so the colours can be read on paper. */
    var LEG = { feel: [["--f-joy", "joy"], ["--f-eq", "equanimity"], ["--f-ple", "bodily pleasure"], ["--f-pain", "bodily pain"], ["--f-dis", "displeasure"], ["--f-joy", "supramundane (joy or equanimity, by jhāna)", 0.55]],
      kind: [["--bad", "unwholesome"], ["--nama", "wholesome"], ["--nama-2", "resultant"], ["--muted", "functional"], ["--nib", "path"], ["--nib", "fruit", 0.55]] };
    function legend() { var el = $("d2-tower-legend"); if (el) el.innerHTML = LEG[mode].map(function (l) { return '<span><i style="background:var(' + l[0] + ');opacity:' + (l[2] || 1) + ';outline:1px solid var(--line)"></i>' + l[1] + "</span>"; }).join(""); }
    var mode = "feel";
    pills($("d2-tower-btns"), [{ id: "feel", label: "Colour by feeling" }, { id: "kind", label: "Colour by kind" }], mode, function (v) { mode = v; legend(); apply(); });
    legend();
    var S = make3D("d2-tower", { height: 300, cam: [0, 3.0, 8.4], look: [0, 1.15, 0], fov: 34, spin: 0.16, rotX: 0.05, phoneRatio: 0.8, fit: true });
    if (!S) return;
    var edgeG = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.2, 0.22, 0.2)), edgeM = lineMat("--muted", 0.45);
    var mats = {}, cubes = [];
    function mat(v, op) { var key = v + (op || ""); if (!mats[key]) mats[key] = stdMat(v, { glow: 0.25, opacity: op }); return mats[key]; }
    tiers.forEach(function (t) {
      var n = t.f.length;
      var plat = new THREE.Mesh(new THREE.CylinderGeometry(t.r + 0.25, t.r + 0.4, 0.12, 64), basicMat("--line", 0.5)); plat.position.y = t.y - 0.18; S.root.add(plat);
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2, c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2));
        c.position.set(Math.cos(a) * t.r, t.y, Math.sin(a) * t.r); c.rotation.y = -a; c.userData = { f: t.f[i], k: t.k[i] }; S.root.add(c); cubes.push(c);
        c.add(new THREE.LineSegments(edgeG, edgeM));
      }
      label(S, t.n, anchor(S, 0, t.y + 0.05, t.r + 0.45), "sm");
    });
    var orb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 22), stdMat("--nib", { glow: 0.6 })); orb.position.y = 3.25; S.root.add(orb);
    label(S, "Nibbāna", anchor(S, 0, 3.75, 0), "p");
    function apply() {
      cubes.forEach(function (c) { c.material = mode === "feel" ? mat(FEEL[c.userData.f], c.userData.f === "V" ? 0.55 : undefined) : mat(KC[c.userData.k], c.userData.k === "Q" ? 0.55 : undefined); });
      S.dirty = true;
    }
    apply();
  })();

  /* ================= 4. D2: constellation of factors ================= */
  (function () {
    var NAMES = {
      u: [["phassa", "contact"], ["vedanā", "feeling"], ["saññā", "perception"], ["cetanā", "volition"], ["ekaggatā", "one-pointedness"], ["jīvitindriya", "psychic life"], ["manasikāra", "attention"]],
      o: [["vitakka", "initial application"], ["vicāra", "sustained application"], ["adhimokkha", "decision"], ["viriya", "energy"], ["pīti", "zest"], ["chanda", "desire to act"]],
      a: [["moha", "delusion"], ["ahirika", "shamelessness"], ["anottappa", "fearlessness of wrong"], ["uddhacca", "restlessness"], ["lobha", "greed"], ["diṭṭhi", "wrong view"], ["māna", "conceit"], ["dosa", "hatred"], ["issā", "envy"], ["macchariya", "avarice"], ["kukkucca", "worry"], ["thīna", "sloth"], ["middha", "torpor"], ["vicikicchā", "doubt"]],
      b: [["saddhā", "faith"], ["sati", "mindfulness"], ["hiri", "shame of wrong"], ["ottappa", "fear of wrong"], ["alobha", "non-greed"], ["adosa", "non-hatred"], ["tatramajjhattatā", "neutrality"], ["kāya-passaddhi", "tranquillity of factors"], ["citta-passaddhi", "tranquillity of mind"], ["kāya-lahutā", "lightness of factors"], ["citta-lahutā", "lightness of mind"], ["kāya-mudutā", "malleability of factors"], ["citta-mudutā", "malleability of mind"], ["kāya-kammaññatā", "wieldiness of factors"], ["citta-kammaññatā", "wieldiness of mind"], ["kāya-pāguññatā", "proficiency of factors"], ["citta-pāguññatā", "proficiency of mind"], ["kāyujjukatā", "rectitude of factors"], ["cittujjukatā", "rectitude of mind"], ["sammā-vācā", "right speech"], ["sammā-kammanta", "right action"], ["sammā-ājīva", "right livelihood"], ["karuṇā", "compassion"], ["muditā", "appreciative joy"], ["paññindriya", "wisdom"]]
    };
    function ids(k, a, b) { var r = []; for (var i = a; i <= b; i++) r.push(k + i); return r; }
    var U7 = ids("u", 0, 6), O6 = ids("o", 0, 5), A4 = ids("a", 0, 3), B19 = ids("b", 0, 18), ABST = ids("b", 19, 21), ILL = ids("b", 22, 23), PAN = ["b24"];
    var C = [
      { id: "eye", label: "Eye-consc.", fixed: U7, vary: [], d: "Eye-consciousness: only the seven universals." },
      { id: "greed", label: "Greed-rooted", fixed: U7.concat(O6, A4, ["a4", "a5"]), vary: [], d: "Greed-rooted, joyful, with wrong view: 19 factors, all on the unwholesome side." },
      { id: "kusala", label: "Wholesome", fixed: U7.concat(O6, B19, PAN), vary: ABST.concat(ILL), d: "Sense-sphere wholesome with knowledge: 33 fixed factors, and up to 5 more that join one at a time." },
      { id: "path", label: "Path", fixed: U7.concat(O6, B19, ABST, PAN), vary: [], d: "Path consciousness: 36 factors, with the three abstinences together." }
    ];
    var cur = "greed", S = make3D("d2-ceta", { height: 290, cam: [0, 0.9, 9.6], look: [0, 0, 0], fov: 36, sway: 0.5, rotX: 0.18, phoneRatio: 0.9, fit: true });
    var state = {}, pts = [], dim;
    function apply() {
      var c = C.filter(function (x) { return x.id === cur; })[0];
      state = {}; c.fixed.forEach(function (x) { state[x] = "fixed"; }); c.vary.forEach(function (x) { state[x] = "var"; });
      pts.forEach(function (m) { var s = state[m.userData.id]; m.material = s ? m.userData.full : dim; m.scale.setScalar(s ? 1 : 0.7); });
      if ($("d2-ceta-cap")) $("d2-ceta-cap").textContent = c.d + " Unwholesome factors (red) and beautiful ones (indigo) sit on opposite half-spheres: they never share a citta.";
      if (S) S.dirty = true;
    }
    pills($("d2-ceta-btns"), C, cur, function (v) { cur = v; apply(); });
    if (!S) { apply(); return; }
    var R = S.root, mats = { u: "--nama", o: "--nama-2", a: "--bad", b: "--nama" };
    dim = basicMat("--muted", 0.22);
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 36, 24), stdMat("--nama", { glow: 0.45 })); R.add(core);
    label(S, "citta", anchor(S, 0, -0.62, 0), "p");
    function add(key, i, pos) { var full = stdMat(mats[key], { glow: 0.35 }); var m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), full); m.position.copy(pos); R.add(m); m.userData = { id: key + i, name: NAMES[key][i], full: full }; pts.push(m); }
    for (var i = 0; i < 7; i++) { var a = i * Math.PI * 2 / 7; add("u", i, V(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95)); }
    var e = new THREE.Euler(1.15, 0, 0.5);
    for (i = 0; i < 6; i++) { a = i * Math.PI * 2 / 6 + 0.3; add("o", i, V(Math.cos(a) * 1.45, 0, Math.sin(a) * 1.45).applyEuler(e)); }
    function hemi(key, n, sign) { var GA = Math.PI * (3 - Math.sqrt(5)); for (var k = 0; k < n; k++) { var h = 0.12 + 0.86 * (k + 0.5) / n, r = Math.sqrt(1 - h * h), th = k * GA; add(key, k, V(sign * h * 2.25, Math.cos(th) * r * 2.25, Math.sin(th) * r * 2.25)); } }
    hemi("a", 14, -1); hemi("b", 25, 1);
    var shellG = new THREE.SphereGeometry(2.25, 32, 20, -Math.PI / 2, Math.PI);
    R.add(new THREE.Mesh(shellG, basicMat("--bad", 0.07, true)));
    var wr = new THREE.Mesh(shellG, basicMat("--nama", 0.07, true)); wr.rotation.y = Math.PI; R.add(wr);
    var dv = new THREE.Mesh(new THREE.CircleGeometry(2.45, 64), basicMat("--muted", 0.07)); dv.rotation.y = Math.PI / 2; R.add(dv);
    label(S, "unwholesome", anchor(S, -2.4, 2.25, 0), "sm"); label(S, "beautiful", anchor(S, 2.4, 2.25, 0), "sm");
    S.update = function (dt, t) { if (!dt) return; pts.forEach(function (m) { if (state[m.userData.id] === "var") m.scale.setScalar(1 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3))); }); };
    var tip = $("d2-ceta-tip");
    S.cv.addEventListener("pointermove", function (ev) {
      if (S.isDragging() || !tip) { if (tip) tip.style.opacity = 0; return; }
      var o = S.pick(ev, pts); if (!o) { tip.style.opacity = 0; return; }
      var r = S.cv.getBoundingClientRect(), st = state[o.userData.id];
      tip.innerHTML = "<i>" + o.userData.name[0] + "</i> · " + o.userData.name[1] + (st === "fixed" ? " · present" : st === "var" ? " · may join" : " · absent");
      tip.style.transform = "translate(" + (ev.clientX - r.left + 12) + "px," + (ev.clientY - r.top - 28) + "px)"; tip.style.opacity = 1;
    });
    S.cv.addEventListener("pointerleave", function () { if (tip) tip.style.opacity = 0; });
    apply();
  })();

  /* ================= 5. D2: kalāpa ================= */
  (function () {
    var OCT = [["pathavī", "earth", "--rupa", [-1, -1, -1]], ["āpo", "water", "--water", [1, -1, -1]], ["tejo", "fire", "--temp", [1, -1, 1]], ["vāyo", "air", "--air", [-1, -1, 1]],
      ["vaṇṇa", "colour", "--rupa-mark", [-1, 1, -1]], ["gandha", "smell", "--rupa-mark", [1, 1, -1]], ["rasa", "taste", "--rupa-mark", [1, 1, 1]], ["ojā", "nutritive essence", "--rupa-mark", [-1, 1, 1]]];
    var ADD = { life: ["jīvita", "life", "--kamma", [0, 0, 0]], eye: ["cakkhu", "eye-sensitivity", "--rupa", [0, 1.9, 0]], heart: ["hadaya", "heart-base", "--heart", [0, 1.9, 0]],
      sound: ["sadda", "sound", "--water", [1.95, 0, 0]], vint: ["vacī-viññatti", "vocal intimation", "--nama", [-1.95, 0, 0]],
      m1: ["lahutā", "lightness", "--food", [-0.75, -1.95, 0.45]], m2: ["mudutā", "malleability", "--food", [0.75, -1.95, 0.45]], m3: ["kammaññatā", "wieldiness", "--food", [0, -1.95, -0.85]] };
    var K = [
      { id: "eye", label: "Eye-decad", a: ["life", "eye"], d: "Kamma-born: the eight inseparables, the life faculty and eye-sensitivity." },
      { id: "heart", label: "Heart decad", a: ["life", "heart"], d: "Kamma-born: in beings with bodies, the base of every citta except the ten sense consciousnesses." },
      { id: "oct", label: "Pure octad", a: [], d: "The eight inseparables alone: the smallest possible group of matter." },
      { id: "tri", label: "Speech", a: ["vint", "sound", "m1", "m2", "m3"], d: "Mind-born tridecad: vocal intimation, sound and the three mutable qualities, thirteen members in all." }
    ];
    var cur = "eye", S = make3D("d2-kal", { height: 290, cam: [0, 1.1, 9.6], look: [0, -0.05, 0], fov: 36, spin: 0.22, rotX: 0.32, rotY: 0.6, phoneRatio: 0.9,
      fit: true, declutter: true, printSearch: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4] });
    var nodes = {};
    function show(id) {
      cur = id; var k = K.filter(function (x) { return x.id === id; })[0];
      if (S) Object.keys(ADD).forEach(function (key) { var on = k.a.indexOf(key) >= 0, n = nodes[key]; n.m.visible = on; n.sp.visible = on && key !== "life"; n.L.hidden = !on; });
      if ($("d2-kal-cap")) $("d2-kal-cap").textContent = k.d + " The cube's corners are the eight inseparables: the four great elements below, colour, smell, taste and nutritive essence above.";
      if (S) S.dirty = true;
    }
    pills($("d2-kal-btns"), K, cur, show);
    if (!S) { show(cur); return; }
    var R = S.root;
    OCT.forEach(function (o, i) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(i < 4 ? 0.3 : 0.24, 28, 20), stdMat(o[2], { glow: 0.25 }));
      m.position.set(o[3][0] * 0.95, o[3][1] * 0.95, o[3][2] * 0.95); R.add(m); label(S, '<i class="p">' + o[0] + "</i>", anchor(S, 0, i < 4 ? -0.42 : 0.38, 0, m), "xs", { pri: 4 });
    });
    R.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 1.9, 1.9)), lineMat("--muted", 0.55)));
    Object.keys(ADD).forEach(function (k) {
      var a = ADD[k], m = new THREE.Mesh(new THREE.SphereGeometry(k === "life" ? 0.26 : 0.22, 26, 18), stdMat(a[2], { glow: 0.35 }));
      m.position.set(a[3][0], a[3][1], a[3][2]); R.add(m);
      var L = label(S, '<i class="p">' + a[0] + "</i>", anchor(S, 0, k === "life" ? 0.34 : 0.36, 0, m), "xs", { pri: 6 });
      var sp = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), m.position.clone()]), lineMat(a[2], 0.6)); R.add(sp);
      nodes[k] = { m: m, L: L, sp: sp };
    });
    show(cur);
  })();

  /* ================= 6. D3: process track =================
     Names sit in two rows under the track (short forms on phones), so no name overlaps a block, the object bar
     or its neighbour. Seeing is drawn as an indigo outline: it is a citta, not matter. */
  (function () {
    var STR = [
      { id: "vgreat", label: "Very great", s: "a bh bu pa vi sa st vo ja ja ja ja ja ja ja ta ta" },
      { id: "great", label: "Great", s: "a a a bh bu pa vi sa st vo ja ja ja ja ja ja ja" },
      { id: "slight", label: "Slight", s: "a a a a a bh bu pa vi sa st vo vo vo b b b" },
      { id: "vslight", label: "Very slight", s: "a a a a a a a a a a a a bh bh b b b" },
      { id: "mind", label: "Mind door", s: "bh bu ma ja ja ja ja ja ja ja ta ta" }
    ];
    var KIND = { a: ["bh", "past", "past"], b: ["bh", "bhavaṅga", "bh."], bh: ["bh2", "vibrating", "vib."], bu: ["bh2", "arrest", "arr."], pa: ["pr", "adverting", "adv."], ma: ["pr", "adverting", "adv."], vi: ["vi", "seeing", "see"], sa: ["pr", "receiving", "rec."], st: ["pr", "investigating", "inv."], vo: ["pr", "determining", "det."], ja: ["ja", "javana ×7", "javana ×7"], ta: ["ta", "registration", "reg."] };
    var H = { bh: 0.18, bh2: 0.26, pr: 0.5, vi: 0.62, ja: 0.95, ta: 0.42 };
    var CO = { bh: "--line", bh2: "--muted", pr: "--nama-2", vi: "--nama", ja: "--nama", ta: "--nama-2" };
    var cur = "vgreat";
    var S = make3D("d3-proc", { height: 270, printHeight: 255, cam: [0, 2.6, 7.3], look: [0, 0.4, 0], fov: 34, sway: 0.22, rotX: 0.04, phoneRatio: 0.5, fit: true });
    var group = null, seeds = [], objBar = null, mats = {};
    function mat(k) { if (!mats[k]) mats[k] = k === "vi" ? stdMat("--nama", { glow: 0.2, opacity: 0.18 }) : stdMat(CO[k], { glow: 0.25, opacity: k === "bh" ? 0.6 : undefined }); return mats[k]; }
    function build() {
      if (!S) return;
      if (group) S.root.remove(group);
      group = new THREE.Group(); S.root.add(group); seeds = [];
      S.labels = S.labels.filter(function (L) { if (L.tmp) { L.el.remove(); return false; } return true; });
      var codes = STR.filter(function (x) { return x.id === cur; })[0].s.split(" "), n = codes.length, step = 0.48, x0 = -((n - 1) * step) / 2;
      var shown = {}, row = 0;
      codes.forEach(function (c, i) {
        var k = KIND[c][0], h = H[k], x = x0 + i * step;
        var m = new THREE.Mesh(new THREE.BoxGeometry(0.38, h, 0.5), mat(k)); m.position.set(x, h / 2, 0); group.add(m);
        if (k === "vi") { var ed = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lineMat("--nama", 0.95)); m.add(ed); }
        if (k === "ja") {
          var sd = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), stdMat("--kamma", { glow: 0.5 })); sd.position.set(x, 1.15, 0); sd.userData.base = 1.15; sd.userData.ph = i * 0.6; group.add(sd); seeds.push(sd);
        }
        if (c !== "vi" && cur !== "vslight") {
          var mb = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), stdMat("--nama", { glow: 0.2, opacity: 0.85 })); mb.position.set(x, -0.3, 0.12); group.add(mb);
        }
        var name = KIND[c][1];
        if (!shown[name]) {
          shown[name] = true;
          var lx = c === "ja" ? x + 3 * step : x, ly = row % 2 ? -1.08 : -0.64;
          var L = label(S, name, anchor(S, lx, ly, 0.3, group), "xs", { short: KIND[c][2] }); L.tmp = true; relabel(L, S.w < 560 ? L.short : L.html);
          row++;
        }
      });
      if (cur !== "mind") {
        var len = n * step - 0.08;
        objBar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.3), stdMat("--rupa-mark", { glow: 0.35 })); objBar.position.set(0, 1.55, -0.1); group.add(objBar);
        var L2 = label(S, "the object: 17 moments of matter", anchor(S, 0, 1.8, -0.1, group), "sm"); L2.tmp = true;
      }
      var L3 = label(S, "mind-born matter", anchor(S, x0 - 0.35, -0.3, 0.12, group), "xs left"); L3.tmp = true;
      S.dirty = true;
    }
    pills($("d3-proc-btns"), STR, cur, function (v) { cur = v; build(); });
    if (!S) return;
    var floor = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.03, 1.1), basicMat("--line", 0.4)); floor.position.y = -0.02; S.root.add(floor);
    S.update = function (dt, t) { seeds.forEach(function (sd) { sd.position.y = sd.userData.base + (dt ? 0.12 * Math.sin(t * 2 + sd.userData.ph) : 0); sd.rotation.y = t; }); };
    build();
  })();

  /* ================= 7. D3: the clock of matter =================
     Replaces the "loom" (bars stacked by layer, which printed as a parallelogram texture).
     One turn of the pointer = 51 sub-moments = 17 cittas = the life of one unit of matter. Each ring is one origin;
     each bar is one generation, set down where the pointer stood when it arose and shrinking as it ages, so it
     ceases when the pointer comes round again. The rings stay full while every bar is replaced: a standing wave. */
  (function () {
    var MODES = [{ id: "birth", label: "Conception" }, { id: "life", label: "During life" }, { id: "death", label: "Approaching death" }];
    var TEXT = {
      birth: ["Conception.", "Kamma-born matter begins with the rebirth-linking citta, one generation at every sub-moment; temperature-born at its presence phase; mind-born only with the first life-continuum; nutriment-born once nutriment is absorbed. Each ring fills during the first turn."],
      life: ["During life.", "Each bar is one generation of matter, set down where the pointer stood when it arose and shrinking as it ages. It ceases when the pointer comes round again: one turn is 17 cittas, or 51 sub-moments. Every bar is replaced, yet the rings stay full: about 51 generations of kamma-born matter and 17 of mind-born matter are alive at once. The body is a standing wave of arising and ceasing."],
      death: ["Approaching death.", "From the seventeenth citta before death, kamma makes no new matter, so the kamma-born ring empties in one last turn and its last units cease exactly at death. Mind-born and nutriment-born matter stop with death; temperature-born matter continues, as the corpse."]
    };
    var N = 51, LIFE = 51, DEATH = 90, mode = "life", now = 62;
    function text() { if ($("d3-loom-title")) { $("d3-loom-title").textContent = TEXT[mode][0]; $("d3-loom-text").textContent = TEXT[mode][1]; } }
    var S = make3D("d3-loom", { height: 330, printHeight: 310, cam: [0, 7.4, 6.6], look: [0, 0.2, 0.3], fov: 36, sway: 0.18, phoneRatio: 0.8, fit: true, declutter: true });
    var lanes = [
      { id: "kamma", c: "--kamma", R: 3.05, every: 1, w: 0.2, label: "kamma-born · ~51 alive" },
      { id: "mind", c: "--nama", R: 2.4, every: 3, w: 0.32, label: "mind-born · ~17 alive" },
      { id: "temp", c: "--temp", R: 1.75, every: 2, w: 0.2, label: "temperature-born" },
      { id: "food", c: "--food", R: 1.1, every: 4, w: 0.22, label: "nutriment-born" }
    ];
    function ang(t) { return -Math.PI / 2 + (t / N) * Math.PI * 2; }
    function arrives(lane, s) {
      if (((s % lane.every) + lane.every) % lane.every !== 0) return false;
      if (mode === "birth" && ((lane.id === "kamma" && s < 0) || (lane.id === "temp" && s < 1) || (lane.id === "mind" && s < 3) || (lane.id === "food" && s < 66))) return false;
      if (mode === "death" && ((lane.id === "kamma" && s >= DEATH - LIFE) || ((lane.id === "mind" || lane.id === "food") && s > DEATH))) return false;
      return true;
    }
    var marks = {};
    function build() {
      text();
      if (!S) return;
      now = mode === "life" ? 62 : mode === "birth" ? 0 : 30;
      marks.birth.hidden = mode !== "birth"; marks.death.hidden = mode !== "death"; marks.corpse.hidden = mode !== "death";
      S.dirty = true;
    }
    pills($("d3-loom-modes"), MODES, mode, function (v) { mode = v; build(); });
    if (!S) { text(); return; }
    var base = new THREE.Mesh(new THREE.CylinderGeometry(3.95, 3.95, 0.04, 96), basicMat("--line", 0.35)); base.position.y = -0.04; S.root.add(base);
    lanes.forEach(function (lane, li) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(lane.R, 0.012, 6, 120), basicMat(lane.c, 0.5)); ring.rotation.x = Math.PI / 2; S.root.add(ring);
      lane.mat = stdMat(lane.c, { glow: 0.4, opacity: 0.95 });
      lane.geo = new THREE.BoxGeometry(lane.w, 1, 0.16); lane.geo.translate(0, 0.5, 0);
      lane.pool = [];
      for (var i = 0; i < Math.ceil(N / lane.every) + 1; i++) { var m = new THREE.Mesh(lane.geo, lane.mat); m.visible = false; m.userData.nofit = i > 0; S.root.add(m); lane.pool.push(m); }
      label(S, lane.label, anchor(S, 0, 0.05, lane.R + 0.2), "xs", { pri: 8 });
    });
    /* the citta ring: 17 cittas of 3 sub-moments each; the current one is lit */
    var cMat = { on: stdMat("--nama", { glow: 0.5 }), off: basicMat("--nama-2", 0.35) }, cittas = [];
    for (var k = 0; k < 17; k++) {
      var a = ang(k * 3 + 1.5), d = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.2), cMat.off);
      d.position.set(Math.cos(a) * 3.65, 0, Math.sin(a) * 3.65); d.rotation.y = -a + Math.PI / 2; S.root.add(d); cittas.push(d);
    }
    label(S, "17 cittas = one turn", anchor(S, Math.cos(ang(40)) * 4.05, 0.05, Math.sin(ang(40)) * 4.05), "xs left", { pri: 7, minW: 560 });
    /* the pointer: a thin upright blade from the hub to the citta ring */
    var ptrG = new THREE.PlaneGeometry(3.9, 1.05); ptrG.rotateY(Math.PI / 2); ptrG.translate(0, 0.52, 1.95);
    var ptr = new THREE.Mesh(ptrG, basicMat("--ink", 0.14)); ptr.material.side = THREE.DoubleSide; S.root.add(ptr);
    var edgeG = new THREE.BoxGeometry(0.03, 0.03, 3.9); edgeG.translate(0, 1.05, 1.95); ptr.add(new THREE.Mesh(edgeG, basicMat("--ink", 0.8)));
    var nowA = new THREE.Object3D(); nowA.position.set(0, 1.3, 3.95); ptr.add(nowA); label(S, "now", nowA, "xs", { pri: 9 });
    marks.birth = label(S, "rebirth-linking", anchor(S, Math.cos(ang(0)) * 3.65, 0.25, Math.sin(ang(0)) * 3.65), "xs", { pri: 9 });
    marks.death = label(S, "death · one turn after kamma's last matter", anchor(S, Math.cos(ang(DEATH)) * 3.65, 0.25, Math.sin(ang(DEATH)) * 3.65), "xs", { pri: 9 });
    marks.corpse = label(S, "the corpse: temperature only", anchor(S, 0, 0.6, 0), "xs", { pri: 9 });
    S.update = function (dt) {
      if (dt) { now += dt * 12; var end = mode === "life" ? 62 + N * 3 : mode === "birth" ? 120 : 125; if (now >= end) now = mode === "life" ? 62 : mode === "birth" ? 0 : 30; }
      ptr.rotation.y = Math.PI / 2 - ang(now);
      lanes.forEach(function (lane) {
        var used = 0;
        for (var s = Math.floor(now); s > now - LIFE && used < lane.pool.length; s--) {
          if (!arrives(lane, s)) continue;
          var m = lane.pool[used++], a = ang(s + 0.5), life = 1 - (now - s) / LIFE;
          m.visible = true; m.position.set(Math.cos(a) * lane.R, 0, Math.sin(a) * lane.R); m.rotation.y = -a + Math.PI / 2;
          m.scale.y = 0.06 + 0.8 * Math.max(0, life);
        }
        for (; used < lane.pool.length; used++) lane.pool[used].visible = false;
      });
      var ci = Math.floor(((now % N) + N) % N / 3), dead = mode === "death" && now > DEATH;
      cittas.forEach(function (c, i) { c.material = i === ci && !dead ? cMat.on : cMat.off; });
    };
    S.beforePrint = function () { mode = "life"; setPressed($("d3-loom-modes"), "life"); build(); now = 62; };
    build();
  })();

  /* ================= 8. D4: the twelve links as a helix through three lives =================
     Time climbs upward. Twelve links on one turn of a helix, with an arrow on each step between them; floors
     for the three lives, tabbed at the left; a spine inside carrying the four groups; rings at the three
     connections; halos on the two roots. Views: step through (default), three rounds, four groups, three
     lives; the legend box below says what the view shows. Point at a link for what it is.
     Data: links12.yaml and the D4 notes in models3d.yaml, passed in by the page as #d4-helix-data. */
  (function () {
    var D = jsonData("d4-helix-data"); if (!$("d4-helix") || !D) return;
    var L = D.links, NOTE = D.notes || {}, N = L.length;
    var RC = { D: "--bad", K: "--nama", R: "--rupa-mark", KR: "--rupa-mark" }, RN = { D: "round of defilements", K: "round of kamma", R: "round of results", KR: "kamma and result" };
    var GC = ["--muted", "--nama", "--kamma", "--nib"], GN = ["past causes", "present results", "present causes", "future results"];
    var LC = { past: "--muted", "this": "--nama", next: "--nib" }, LN = { past: "past life", "this": "this life", next: "next life" };
    var VIEWS = ["step", "rounds", "groups", "lives"], view = "step", cur = 0, timer = null;
    pills($("d4-helix-btns"), VIEWS.map(function (v) { return { id: v, label: (NOTE[v] || {}).label || v }; }), view, function (v) { view = v; stop(); apply(); });
    var S = make3D("d4-helix", { height: 440, printHeight: 420, cam: [0, 1.3, 10.6], look: [0, 0, 0], fov: 36, sway: 0.3, rotY: 0.2, phoneRatio: 1.25, fit: true, declutter: true,
      printSearch: [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3] });
    if (!S) { legend(); return; }
    var RAD = 2.3, STEP = 0.62, Y0 = -3.4;
    function at(t) { var a = t * 30 * Math.PI / 180 - Math.PI / 2 - 0.2; return V(Math.cos(a) * RAD, Y0 + t * STEP, Math.sin(a) * RAD); }
    var mats = {};
    function mat(v, dim) { var k = v + (dim ? "/d" : ""); if (!mats[k]) mats[k] = stdMat(v, { glow: dim ? 0.15 : 0.35, opacity: dim ? 0.22 : 1 }); return mats[k]; }
    /* links */
    var nodes = [], labs = [];
    L.forEach(function (l, i) {
      var p = at(i), m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20), mat("--muted")); m.position.copy(p); m.userData.i = i; S.root.add(m); nodes.push(m);
      if (l.round === "KR") { var k2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), mat("--nama")); k2.position.copy(p).add(V(0, 0.32, 0)); S.root.add(k2); m.userData.moon = k2; }
      labs.push(label(S, l.n + " <i>" + l.pali + "</i> · " + l.en, anchor(S, p.x * 1.17, p.y, p.z * 1.17), "sm right", { pri: 5, short: l.n + " " + l.en }));
    });
    /* steps between links, each with its arrowhead */
    var segOn = basicMat("--ink", 0.9), segOff = basicMat("--muted", 0.45), segDim = basicMat("--muted", 0.15);
    var arrOn = stdMat("--ink", { glow: 0.3 }), arrOff = stdMat("--muted", { glow: 0.2 });
    var segs = [];
    for (var i = 0; i < N - 1; i++) {
      var ps = []; for (var k = 0; k <= 6; k++) ps.push(at(i + 0.12 + 0.62 * k / 6));
      var tb = tube(ps, 0.03, segOff); S.root.add(tb);
      var tip = at(i + 0.86), tan = at(i + 0.87).sub(at(i + 0.85)).normalize(), ar = arrow(tip, tan, arrOff, 0.08, 0.22); S.root.add(ar);
      segs.push({ tb: tb, ar: ar });
    }
    /* floors for the three lives, with tabs */
    var cut1 = Y0 + 1.5 * STEP, cut2 = Y0 + 9.5 * STEP, top = Y0 + (N - 1) * STEP + 0.5, bot = Y0 - 0.45;
    var lives = [["past", bot, cut1], ["this", cut1, cut2], ["next", cut2, top]].map(function (b) {
      var h = b[2] - b[1], walls = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, h, 48, 1, true), basicMat(LC[b[0]], 0.06)); walls.position.y = b[1] + h / 2; walls.material.side = THREE.DoubleSide; S.root.add(walls);
      var floor = new THREE.Mesh(new THREE.CircleGeometry(2.8, 48), basicMat(LC[b[0]], 0.1)); floor.rotation.x = -Math.PI / 2; floor.position.y = b[1]; floor.material.side = THREE.DoubleSide; S.root.add(floor);
      var ns = L.filter(function (l) { return l.life === b[0]; }), rng = ns[0].n + (ns.length > 1 ? "–" + ns[ns.length - 1].n : "");
      var tab = label(S, LN[b[0]].toUpperCase() + " · " + rng, anchor(S, -3.15, b[1] + h / 2, 0, S.scene), "cap3 left", { pri: 6, short: b[0].toUpperCase() + " · " + rng });
      return { walls: walls, floor: floor, tab: tab, c: LC[b[0]] };
    });
    /* the spine of four groups */
    var groups = [0, 1, 2, 3].map(function (g) {
      var idx = L.map(function (l, j) { return l.group === g ? j : -1; }).filter(function (j) { return j >= 0; });
      var y0 = Y0 + idx[0] * STEP - 0.22, y1 = Y0 + idx[idx.length - 1] * STEP + 0.22;
      var sp = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, y1 - y0, 16), mat(GC[g])); sp.position.y = (y0 + y1) / 2; S.root.add(sp);
      var lb = label(S, GN[g], anchor(S, 0, (y0 + y1) / 2, 0), "xs", { pri: 4 });
      return { sp: sp, lb: lb, c: GC[g] };
    });
    /* the three connections and the two roots */
    var joins = [[1, "cause → result"], [6, "result → cause"], [9, "cause → result"]].map(function (c) {
      var p = at(c[0] + 0.5), r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 8, 24), stdMat("--ink", { glow: 0.2 })); r.position.copy(p); r.lookAt(at(c[0] + 0.6)); S.root.add(r);
      return { r: r, lb: label(S, c[1], anchor(S, p.x * 1.25, p.y + 0.02, p.z * 1.25), "xs", { pri: 3 }) };
    });
    var roots = [[0, "root: ignorance"], [7, "root: craving"]].map(function (c) {
      var p = at(c[0]), h = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 40), stdMat("--ink", { glow: 0.2 })); h.position.copy(p); h.rotation.x = Math.PI / 2; S.root.add(h);
      return { h: h, lb: label(S, c[1], anchor(S, p.x * 0.72, p.y - 0.38, p.z * 0.72), "xs", { pri: 2 }) };
    });
    /* labels sit on the outer side of their link, recomputed as the helix turns */
    var hubV = new THREE.Vector3(), lv = new THREE.Vector3();
    function sideLabels() {
      S.root.updateMatrixWorld(true);
      labs.forEach(function (Lb, j) {
        nodes[j].getWorldPosition(lv); hubV.set(0, lv.y, 0);
        var right = lv.sub(hubV).applyQuaternion(S.camera.quaternion.clone().invert()).x >= 0;
        Lb.el.classList.toggle("right", right); Lb.el.classList.toggle("left", !right);
      });
    }
    S.beforeFit = sideLabels; S.update = function () { sideLabels(); };

    function legend() {
      var box = $("d4-helix-legend"); if (!box) return;
      var n = NOTE[view] || {}, html = "";
      if (view === "step") {
        var l = L[cur], nx = L[cur + 1];
        html = '<p class="lab">Link ' + l.n + " of " + N + "</p><h3>" + l.n + " <i lang=\"pi\">" + esc3(l.pali) + "</i> · " + esc3(l.en) +
          (nx ? ' <span class="muted">→ ' + nx.n + " " + esc3(nx.en) + "</span>" : "") + "</h3>" +
          '<p class="small muted">' + LN[l.life] + " · " + RN[l.round] + " · " + GN[l.group] + "</p>" +
          '<p class="small">' + esc3(l.what) + "</p>" + (l.leads ? '<p class="small"><b>Then:</b> ' + esc3(l.leads) + "</p>" : "") +
          '<p class="small muted">' + (n.text || "") + "</p>";
      } else html = "<h3>" + (n.label || "") + '</h3><p class="small">' + (n.text || "") + "</p>";
      box.innerHTML = html;
    }
    function apply() {
      var step = view === "step";
      nodes.forEach(function (m, j) {
        var l = L[j], v = view === "rounds" ? RC[l.round] : view === "groups" ? GC[l.group] : view === "lives" ? LC[l.life] : (j === cur ? RC[l.round] : "--muted");
        var dim = step && j !== cur && j !== cur + 1;
        m.material = mat(step && j === cur + 1 ? RC[l.round] : v, dim);
        m.scale.setScalar(step && j === cur ? 1.35 : 1);
        if (m.userData.moon) m.userData.moon.material = mat("--nama", view !== "rounds" && !(step && (j === cur || j === cur + 1)));
        labs[j].alpha = !step || j === cur || j === cur + 1 ? 1 : 0.35;
      });
      segs.forEach(function (s, j) { var on = step && j === cur; s.tb.material = on ? segOn : step ? segDim : segOff; s.ar.material = on ? arrOn : arrOff; s.tb.scale.setScalar(1); });
      groups.forEach(function (g) { g.sp.material = mat(g.c, view !== "groups"); g.lb.alpha = view === "groups" ? 1 : 0; });
      joins.forEach(function (j) { j.r.visible = view === "groups"; j.lb.alpha = view === "groups" ? 1 : 0; });
      roots.forEach(function (r) { r.h.visible = view === "rounds"; r.lb.alpha = view === "rounds" ? 1 : 0; });
      lives.forEach(function (b) { b.walls.material.opacity = view === "lives" ? 0.14 : 0.05; b.floor.material.opacity = view === "lives" ? 0.22 : 0.08; b.tab.alpha = 1; });
      var ctl = $("d4-step"); if (ctl) ctl.hidden = !step;
      legend(); S.dirty = true;
    }
    function go(j) { cur = Math.max(0, Math.min(N - 1, j)); if (view !== "step") { view = "step"; setPressed($("d4-helix-btns"), view); } apply(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } var b = document.querySelector('#d4-step [data-s="play"]'); if (b) { b.textContent = "Play"; b.setAttribute("aria-pressed", "false"); } }
    var ctl = $("d4-step");
    if (ctl) ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; var s = b.getAttribute("data-s");
      if (s === "prev") { stop(); go(cur - 1); } else if (s === "next") { stop(); go(cur + 1); }
      else if (timer) stop();
      else {
        if (cur >= N - 1) go(0);
        b.textContent = "Pause"; b.setAttribute("aria-pressed", "true");
        timer = setInterval(function () { if (cur >= N - 1) { stop(); return; } go(cur + 1); }, 3200);
      }
    });
    /* point at a link: what it is; click a link: step to it */
    var tipc = tipCard(S, $("d4-helix-tip"));
    function card(j) { var l = L[j]; return "<b>" + l.n + " <i>" + esc3(l.pali) + "</i> · " + esc3(l.en) + '</b><span class="mu">' + LN[l.life] + " · " + RN[l.round] + " · " + GN[l.group] + "</span><span>" + esc3(l.what) + "</span>"; }
    S.cv.addEventListener("pointermove", function (ev) {
      if (S.isDragging()) { tipc.hide(); return; }
      var o = S.pick(ev, nodes); if (!o) { tipc.hide(); S.cv.style.cursor = ""; return; }
      S.cv.style.cursor = "pointer"; tipc.show(ev, card(o.userData.i));
    });
    S.cv.addEventListener("pointerleave", function () { tipc.hide(); });
    S.onClick = function (ev) { var o = S.pick(ev, nodes); if (o) { stop(); go(o.userData.i); tipc.show(ev, card(o.userData.i)); } else tipc.hide(); };
    apply();
  })();

  /* ================= 9. D4: the 24 conditions, by direction =================
     Left, what conditions (paccaya): concepts, mind, matter. Right, what is conditioned (paccayuppanna): mind,
     matter. Each condition is one bead, in a row with the others of its direction. Its strands come from its
     own ways (conditions.yaml): one strand in from each kind of state that can be the condition, one strand
     out, with an arrowhead, to each kind it conditions. Point at a strand, bead or shape for what it means;
     wide invisible tubes along each strand make the thin lines easy to hit. Data: kinds.yaml and
     conditions.yaml, passed in by the page as #d4-comp-data. */
  (function () {
    var DATA = jsonData("d4-comp-data"); if (!$("d4-comp") || !DATA) return;
    var FAMS = DATA.fams, NOTE = DATA.notes || {}, FC = { A: "--g1", B: "--g2", C: "--g3", D: "--g4", E: "--g5", F: "--g6" };
    FAMS.forEach(function (f) { f.c = FC[f.key]; f.conds.forEach(function (c) { c.f = f; }); });
    var cur = "all";
    function names(f) { return f.conds.map(function (c) { return c.en; }).join(", "); }
    function wayLine(w) { return "<i>" + w.from + " → " + w.to + ".</i> " + esc3(w.text); }
    function info() {
      var box = $("d4-comp-info"); if (!box) return;
      if (cur === "all") {
        box.innerHTML = "<h3>24 conditions, six directions</h3><p class=\"small\">Left: what conditions. Right: what is conditioned. Each bead is one condition; its strands run from the states that give the help to the states that receive it.</p>" +
          FAMS.map(function (f) { return '<p class="small"><span class="sw3" style="background:var(' + f.c + ')"></span><b>' + f.title + " · " + f.conds.length + "</b> <i>" + names(f) + ".</i></p>"; }).join("");
        return;
      }
      var f = FAMS.filter(function (x) { return x.key === cur; })[0];
      box.innerHTML = '<h3><span class="sw3" style="background:var(' + f.c + ')"></span>' + f.title + " · " + f.conds.length + '</h3><p class="small">' + (f.desc || "") + "</p>" +
        '<dl class="small m3ways">' + f.conds.map(function (c) {
          return '<dt><a href="' + c.url + '">' + c.n + ". " + c.en + "</a> <i lang=\"pi\">" + c.pali + "</i></dt>" + (c.ways || []).map(function (w) { return "<dd>" + wayLine(w) + "</dd>"; }).join("");
        }).join("") + "</dl>";
    }
    pills($("d4-comp-btns"), [{ id: "all", label: "All" }].concat(FAMS.map(function (f) { return { id: f.key, label: f.title, c: f.c }; })), cur, function (v) { cur = v; info(); if (S) { hl(null); apply(); } });
    info();
    var S = make3D("d4-comp", { height: 480, cam: [0, 3.4, 9.4], look: [0, 0, 0], fov: 36, sway: 0.22, rotY: -0.62, rotX: 0.05, phoneRatio: 1.15, fit: true, declutter: true });
    if (!S) return;
    var X = 3.1, RAD = 0.4;
    var SRC = { concepts: V(-X, 1.95, 0), mind: V(-X, 0.3, 0), matter: V(-X, -1.55, 0) }, TGT = { mind: V(X, 0.75, 0), matter: V(X, -1.15, 0) };
    var bodies = [];
    function body(kind, p, side) {
      var m = kind === "mind" ? new THREE.Mesh(new THREE.SphereGeometry(RAD, 32, 22), stdMat("--nama", { glow: 0.35 }))
        : kind === "matter" ? new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.66, 0.66), stdMat("--rupa-mark", { glow: 0.3 }))
        : new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 12, 40), stdMat("--muted", { glow: 0.25 }));
      m.position.copy(p); m.userData = { kind: "body", k: kind, side: side }; S.root.add(m); bodies.push(m);
      label(S, kind, anchor(S, p.x, p.y - 0.62, p.z), "p", { pri: 3 });
    }
    Object.keys(SRC).forEach(function (k) { body(k, SRC[k], "src"); });
    Object.keys(TGT).forEach(function (k) { body(k, TGT[k], "tgt"); });
    label(S, "WHAT CONDITIONS · <i>paccaya</i>", anchor(S, -X, 2.85, 0), "cap3", { pri: 4, short: "CONDITIONS" });
    label(S, "WHAT IS CONDITIONED · <i>paccayuppanna</i>", anchor(S, X, 2.85, 0), "cap3", { pri: 4, short: "CONDITIONED" });
    /* one row of beads per direction, ordered so the strands cross as little as possible */
    var ROW = { E: 2.05, A: 1.25, B: 0.45, D: -0.35, C: -1.1, F: -1.95 }, STEP = 0.42;
    var pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    var dimTube = basicMat("--muted", 0.05), dimBead = stdMat("--muted", { glow: 0.1, opacity: 0.18 });
    var strands = [], picks = [], beads = [];
    function strand(a, b, c, dir, end) {
      var arrowEnd = dir === "out";
      var ctl = V((a.x + b.x) / 2, arrowEnd ? a.y : b.y, arrowEnd ? a.z : b.z);
      var s = arrowEnd ? a.clone() : a.clone().add(ctl.clone().sub(a).normalize().multiplyScalar(RAD));
      var e = arrowEnd ? b.clone().add(ctl.clone().sub(b).normalize().multiplyScalar(RAD + 0.17)) : b.clone();
      var cv = new THREE.QuadraticBezierCurve3(s, ctl, e), ud = { kind: dir, c: c, end: end };
      var m = new THREE.Mesh(new THREE.TubeGeometry(cv, 48, 0.02, 8, false), c.f.mats.tube); m.userData = ud; S.root.add(m);
      var pk = new THREE.Mesh(new THREE.TubeGeometry(cv, 24, 0.09, 6, false), pickMat);
      pk.userData = ud; S.root.add(pk); picks.push(pk);
      var rec = { m: m, ud: ud, cone: null };
      if (arrowEnd) {
        var t = cv.getTangent(1).normalize();
        rec.cone = arrow(e.clone().add(t.clone().multiplyScalar(0.18)), t, c.f.mats.bead); rec.cone.userData = ud; S.root.add(rec.cone); picks.push(rec.cone);
      }
      strands.push(rec);
    }
    FAMS.forEach(function (f) {
      f.mats = { tube: basicMat(f.c, 0.85), bead: stdMat(f.c, { glow: 0.35, opacity: 1 }) };
      var n = f.conds.length;
      f.beads = f.conds.map(function (c, i) {
        var b = V(0, ROW[f.key], (i - (n - 1) / 2) * STEP), ways = c.ways || [];
        var froms = [], tos = [];
        ways.forEach(function (w) { if (froms.indexOf(w.from) < 0) froms.push(w.from); if (tos.indexOf(w.to) < 0) tos.push(w.to); });
        froms.forEach(function (k) { strand(SRC[k], b, c, "in", k); });
        tos.forEach(function (k) { strand(b, TGT[k], c, "out", k); });
        var m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), f.mats.bead); m.position.copy(b); m.userData = { kind: "bead", c: c }; S.root.add(m); beads.push(m);
        var big = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), pickMat); big.position.copy(b); big.userData = m.userData; S.root.add(big); picks.push(big);
        return label(S, c.n + "", anchor(S, b.x - 0.14, b.y + 0.02, b.z), "xs left", { pri: 1 });
      });
      var zEnd = ((n - 1) / 2) * STEP + 0.35;
      f.L = label(S, '<span class="sw3" style="background:var(' + f.c + ')"></span>' + f.title + " · " + n, anchor(S, 0.1, ROW[f.key], zEnd), "nd right", { pri: 2, minW: 560 });
      f.L.el.style.boxShadow = "inset 0 0 0 1.5px var(" + f.c + ")";
    });
    function active(c) { return cur === "all" || cur === c.f.key; }
    function apply() {
      FAMS.forEach(function (f) {
        var on = cur === "all" || cur === f.key;
        f.mats.tube.opacity = on ? 0.85 : 0.06; f.mats.bead.opacity = on ? 1 : 0.15; f.mats.bead.depthWrite = on;
        f.L.alpha = on ? 1 : 0.15;
        f.beads.forEach(function (L) { L.alpha = on ? 1 : 0; });
      });
      names3(); S.refit(); S.dirty = true;
    }
    /* a selected direction names its beads; on a phone the list under the model does that instead */
    function names3() { FAMS.forEach(function (f) { f.beads.forEach(function (L, i) { var c = f.conds[i]; relabel(L, cur === f.key && S.w >= 560 ? c.n + ". " + c.en : c.n + ""); }); }); }
    S.onSize = names3;

    /* highlighting: keep(rec) says which strands stay lit; beads of conditions with a lit strand stay too */
    var lit = null;
    function hl(keep) {
      lit = keep;
      var litC = [];
      strands.forEach(function (r) {
        var on = !keep || keep(r.ud);
        r.m.material = on ? r.ud.c.f.mats.tube : dimTube; if (r.cone) r.cone.material = on ? r.ud.c.f.mats.bead : dimBead;
        if (on && keep && litC.indexOf(r.ud.c) < 0) litC.push(r.ud.c);
      });
      beads.forEach(function (b) { b.material = !keep || litC.indexOf(b.userData.c) >= 0 ? b.userData.c.f.mats.bead : dimBead; });
      S.dirty = true;
    }
    function head(c) { return "<b>" + c.n + ". " + esc3(c.en) + " <i>" + esc3(c.pali) + "</i></b>"; }
    function describe(u) {
      var c = u.c, ways = c && (c.ways || []);
      if (u.kind === "in") {
        var ws = ways.filter(function (w) { return w.from === u.end; });
        return { html: head(c) + '<span class="mu">from ' + u.end + " · " + c.f.title + "</span>" + ws.map(function (w) { return "<span>" + wayLine(w) + "</span>"; }).join(""),
          keep: function (x) { return x.c === c && (x.kind === "in" ? x.end === u.end : ws.some(function (w) { return w.to === x.end; })); } };
      }
      if (u.kind === "out") {
        var wo = ways.filter(function (w) { return w.to === u.end; });
        return { html: head(c) + '<span class="mu">to ' + u.end + " · " + c.f.title + "</span>" + wo.map(function (w) { return "<span>" + wayLine(w) + "</span>"; }).join(""),
          keep: function (x) { return x.c === c && (x.kind === "out" ? x.end === u.end : wo.some(function (w) { return w.from === x.end; })); } };
      }
      if (u.kind === "bead") return { html: head(c) + '<span class="mu">' + c.f.title + "</span><span>" + esc3(c.gist || "") + "</span>" + ways.map(function (w) { return "<span>" + wayLine(w) + "</span>"; }).join(""),
        keep: function (x) { return x.c === c; } };
      /* a body: what it is, and how many conditions it gives or receives in */
      var all = [].concat.apply([], FAMS.map(function (f) { return f.conds; })), k = u.k;
      var gives = all.filter(function (c) { return (c.ways || []).some(function (w) { return w.from === k; }); }).length;
      var gets = all.filter(function (c) { return (c.ways || []).some(function (w) { return w.to === k; }); }).length;
      var n = NOTE[k] || { text: k };
      return { html: "<b>" + esc3(n.label || k) + '</b><span class="mu">' + (u.side === "src" ? "as what conditions" : "as what is conditioned") + "</span><span>" + esc3(n.text) + "</span><span>" +
          (u.side === "src" ? "Gives help in " + gives + " of the 24 conditions." : "Receives help in " + gets + " of the 24 conditions.") + "</span>",
        keep: function (x) { return x.end === k && (u.side === "src" ? x.kind === "in" : x.kind === "out"); } };
    }
    var tipc = tipCard(S, $("d4-comp-tip"));
    function hit(ev) {
      var o = S.pick(ev, picks.concat(bodies));
      if (o && o.userData.c && !active(o.userData.c)) o = null;
      return o;
    }
    function point(ev) {
      var o = hit(ev);
      if (!o) { tipc.hide(); if (lit) hl(null); S.cv.style.cursor = ""; return; }
      var d = describe(o.userData); S.cv.style.cursor = "help"; tipc.show(ev, d.html); hl(d.keep);
    }
    S.cv.addEventListener("pointermove", function (ev) { if (S.isDragging()) { tipc.hide(); return; } if (ev.pointerType === "mouse") point(ev); });
    S.cv.addEventListener("pointerleave", function () { tipc.hide(); if (lit) hl(null); });
    S.onClick = point;
    apply();
  })();

  /* ================= NR: nine ways mind and matter meet =================
     From the nāma–rūpa model, now part of the reading "Mind and matter together". Mind on the left: a citta
     with its factors circling it. A body on the right, as a cloud of small groups of matter, with the
     heart-base and the eye inside it; around them a visible object, past kamma, temperature and food. Each
     relation is a thread with particles moving along it, in its own direction. Data: namarupa.yaml, passed in
     by the reading as #nr-rel-data, with each condition already resolved to its name and entry link. */
  (function () {
    var REL = jsonData("nr-rel-data"); if (!$("nr-rel") || !REL) return;
    var cur = "all";
    function info() {
      var box = $("nr-rel-info"); if (!box) return;
      if (cur === "all") {
        box.innerHTML = '<p class="lab">Overview</p><h3>Mind and matter, held together</h3><p class="small">Nine relations, drawn as moving threads. Matter gives mind its bases and its objects; mind produces matter and keeps the body going; past kamma builds the sense organs; food and heat renew the body; and at conception the two arise together.</p><p class="small muted">Choose a relation to see it alone.</p>';
        return;
      }
      var r = REL.filter(function (x) { return x.id === cur; })[0];
      box.innerHTML = '<p class="lab">' + esc3(r.dir) + " · " + esc3(r.when) + '</p><h3><span class="sw3" style="background:var(' + r.color + ')"></span>' + esc3(r.label) + '</h3><p class="small">' + esc3(r.text) + "</p>" +
        '<p class="small nr-conds"><b>Conditions:</b> ' + (r.conds.map(function (c) { return '<a href="' + c.url + '">' + esc3(c.en) + "</a>"; }).concat((r.extra || []).map(function (x) { return "<i>" + esc3(x) + "</i>"; })).join(" · ") || "<i>none of the 24</i>") + "</p>";
    }
    pills($("nr-rel-btns"), [{ id: "all", label: "All nine" }].concat(REL.map(function (r) { return { id: r.id, label: r.label, c: r.color }; })), cur, function (v) { cur = v; info(); if (S) S.dirty = true; });
    info();
    var S = make3D("nr-rel", { height: 470, cam: [0, 1.3, 12.2], look: [0, -0.05, 0], fov: 34, sway: 0.38, rotX: 0.06, phoneRatio: 1.05, fit: true });
    if (!S) return;
    var OX = -0.55;
    function P(x, y, z) { return V(x + OX, y, z); }
    var R = S.root, N = P(-2.3, 0.15, 0), B = P(2.1, -0.05, 0);
    var heartP = P(1.85, 0.22, 0.25), eyeP = P(2.0, 1.2, 0.55), mangoP = P(4.25, 1.4, 0.5), kammaP = P(-0.2, -2.05, -1.0), tempP = P(4.05, -1.35, -0.7), foodP = P(3.25, -2.0, 1.0);
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 40, 28), stdMat("--nama", { glow: 0.35 })); core.position.copy(N); R.add(core);
    var shell = new THREE.Mesh(new THREE.SphereGeometry(1.3, 28, 18), basicMat("--nama-2", 0.1, true)); shell.position.copy(N); R.add(shell);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.01, 8, 80), basicMat("--nama", 0.5)); ring.position.copy(N); ring.rotation.x = 1.25; R.add(ring);
    var unis = [];
    for (var i = 0; i < 7; i++) { var un = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), stdMat("--nama-2", { glow: 0.3 })); R.add(un); unis.push(un); }
    var rand = rng(7), cloud = new THREE.Group(); cloud.position.copy(B); R.add(cloud);
    var cubeG = new THREE.BoxGeometry(0.075, 0.075, 0.075), cubeM = stdMat("--rupa-mark", { opacity: 0.62, glow: 0.1 });
    for (var c = 0; c < 240; c++) {
      var x, y, z; do { x = rand() * 2 - 1; y = rand() * 2 - 1; z = rand() * 2 - 1; } while (x * x + y * y + z * z > 1);
      var m = new THREE.Mesh(cubeG, cubeM); m.position.set(x * 0.95, y * 1.35, z * 0.72); m.rotation.set(rand() * 3, rand() * 3, 0); cloud.add(m);
    }
    function obj(g, v, p, glow) { var o = new THREE.Mesh(g, stdMat(v, { glow: glow })); o.position.copy(p); R.add(o); return o; }
    obj(new THREE.BoxGeometry(0.2, 0.2, 0.2), "--heart", heartP, 0.4);
    obj(new THREE.SphereGeometry(0.14, 20, 14), "--rupa", eyeP, 0.3);
    var mango = obj(new THREE.SphereGeometry(0.33, 28, 20), "--f-joy", mangoP, 0.2); mango.scale.set(0.85, 1, 0.85);
    var kam = obj(new THREE.OctahedronGeometry(0.34), "--kamma", kammaP, 0.3), tmp = obj(new THREE.IcosahedronGeometry(0.27), "--temp", tempP, 0.3), food = obj(new THREE.DodecahedronGeometry(0.27), "--food", foodP, 0.25);
    function mid(a, b, dx, dy, dz) { return a.clone().add(b).multiplyScalar(0.5).add(V(dx, dy, dz)); }
    function Q(a, ctl, b) { return new THREE.QuadraticBezierCurve3(a, ctl, b); }
    var curves = {
      heart: Q(heartP, mid(heartP, N, 0, 1.05, 0.5), N.clone().add(V(0.5, 0.1, 0.1))),
      rebirth: Q(N.clone().add(V(0.45, -0.3, 0.15)), mid(N, heartP, 0, -1.2, 0.8), heartP),
      eye: Q(eyeP, mid(eyeP, N, 0, 1.55, 0.3), N.clone().add(V(0.35, 0.42, 0.1))),
      object: Q(mangoP, mid(mangoP, N, 0, 2.4, 0), N.clone().add(V(0.1, 0.55, 0))),
      mindborn: Q(N.clone().add(V(0.5, 0, 0.25)), mid(N, B, 0, 0.35, 1.5), B.clone().add(V(-0.8, 0, 0.3))),
      post: Q(N.clone().add(V(0.5, -0.15, -0.25)), mid(N, B, 0, -0.55, -1.45), B.clone().add(V(-0.8, -0.2, -0.3))),
      kamma: Q(kammaP, mid(kammaP, B, 0, -0.9, 0), B.clone().add(V(-0.3, -1.1, 0))),
      food: Q(foodP, mid(foodP, B, 0, -0.35, 0.4), B.clone().add(V(0.3, -1.0, 0.35))),
      temp: Q(tempP, mid(tempP, B, 0, 0.3, -0.3), B.clone().add(V(0.75, -0.4, -0.3)))
    };
    var tubes = {}, parts = {};
    REL.forEach(function (r) {
      if (!curves[r.id]) return;
      var tb = new THREE.Mesh(new THREE.TubeGeometry(curves[r.id], 64, 0.022, 8, false), basicMat(r.color, 0.4)); R.add(tb); tubes[r.id] = tb;
      var ps = []; for (var k = 0; k < 5; k++) { var p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), basicMat(r.color, 1)); R.add(p); ps.push(p); }
      parts[r.id] = ps;
    });
    label(S, "nāma · mind", anchor(S, N.x, N.y + 1.65, N.z), "p nd");
    label(S, "a citta and its factors", anchor(S, N.x, N.y - 1.6, N.z), "sm");
    label(S, "rūpa · a body of kalāpas", anchor(S, B.x, B.y - 1.75, B.z), "p nd");
    label(S, "heart-base", anchor(S, heartP.x - 0.05, heartP.y + 0.3, heartP.z + 0.2), "sm");
    label(S, "eye-base", anchor(S, eyeP.x, eyeP.y + 0.3, eyeP.z), "sm");
    label(S, "visible form", anchor(S, mangoP.x, mangoP.y + 0.55, mangoP.z), "sm");
    label(S, "past volition · kamma", anchor(S, kammaP.x, kammaP.y - 0.55, kammaP.z), "sm");
    label(S, "temperature", anchor(S, tempP.x, tempP.y - 0.45, tempP.z), "sm");
    label(S, "nutriment", anchor(S, foodP.x, foodP.y - 0.45, foodP.z), "sm");
    S.update = function (dt, t) {
      unis.forEach(function (u, j) { var a = t * 0.5 + j * Math.PI * 2 / 7, v3 = V(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0); v3.applyEuler(ring.rotation); u.position.copy(N).add(v3); });
      if (!RM) { kam.rotation.y += dt * 0.5; tmp.rotation.y -= dt * 0.4; food.rotation.x += dt * 0.3; cloud.rotation.y += dt * 0.05; }
      Object.keys(tubes).forEach(function (id) {
        var on = cur === "all" || cur === id;
        tubes[id].material.opacity = cur === "all" ? 0.45 : (on ? 0.95 : 0.07);
        var speed = cur === "all" ? 0.12 : 0.3;
        parts[id].forEach(function (p, k) {
          p.visible = on && !RM; if (!p.visible) return;
          var u2 = ((t * speed) + k / parts[id].length) % 1; if (id === "rebirth" && k % 2) u2 = 1 - u2;
          p.position.copy(curves[id].getPoint(u2));
        });
      });
      S.dirty = true;
    };
  })();

  /* ================= 10. D5: planes as a world-mountain =================
     The model is round, so it turns (sways) under labels that stay put: plane labels sit in two fixed columns
     with leader lines to their discs; the four group names sit on chips in front of their groups.
     On phones the labels shorten (English, or one label per jhāna group). */
  (function () {
    var P = [
      ["Niraya", "hell", "w", "hell"], ["Tiracchāna", "animals", "w", "animals"], ["Peta", "hungry ghosts", "w", "ghosts"], ["Asura", "titans", "w", "titans"], ["Manussa", "humans", "h", "humans"],
      ["Cātumahārājika", "Four Great Kings · on Sineru's slopes", "s1", "Four Kings"], ["Tāvatiṃsa", "Thirty-three · on the summit", "s2", "Thirty-three"], ["Yāma", "", "d", "Yāma"], ["Tusita", "", "d", "Tusita"], ["Nimmānarati", "", "d", "Nimmānarati"], ["Paranimmitavasavattī", "", "d", "Paranimmita…"],
      ["Brahmapārisajja", "1st jhāna", "b1", "1st jhāna ×3"], ["Brahmapurohita", "", "b1", ""], ["Mahābrahmā", "", "b1", ""],
      ["Parittābha", "2nd jhāna", "b2", "2nd jhāna ×3"], ["Appamāṇābha", "", "b2", ""], ["Ābhassara", "", "b2", ""],
      ["Parittasubha", "3rd jhāna", "b3", "3rd jhāna ×3"], ["Appamāṇasubha", "", "b3", ""], ["Subhakiṇha", "", "b3", ""],
      ["Vehapphala", "4th jhāna", "b4", "4th jhāna"], ["Asaññasatta", "matter only", "b4n", "matter only"], ["Aviha", "pure abode", "b4", "pure abodes ×5"], ["Atappa", "", "b4", ""], ["Sudassa", "", "b4", ""], ["Sudassī", "", "b4", ""], ["Akaniṭṭha", "highest pure abode", "b4", ""],
      ["Ākāsānañcāyatana", "infinite space", "a", "infinite space"], ["Viññāṇañcāyatana", "infinite consciousness", "a", "infinite consc."], ["Ākiñcaññāyatana", "nothingness", "a", "nothingness"], ["Nevasaññānāsaññāyatana", "neither perception nor non-perception", "a", "neither-nor"]
    ];
    var S = make3D("d5-view", { height: 560, printHeight: 600, cam: [0, 4.2, 19.5], look: [0, 3.4, 0], fov: 36, sway: 0.5, rotX: 0.06, phoneRatio: 1.25, fit: true, declutter: true });
    if (!S) return;
    var y = -0.4, prev = null, GAP = { w: 0, h: 0.35, s1: 0.2, s2: 0.2, d: 0.25, b1: 0.35, b2: 0.3, b3: 0.3, b4: 0.3, b4n: 0.3, a: 0.4 };
    var yS = {}, labs = [], LX = 2.75;
    P.forEach(function (p, i) {
      var g = p[2]; y += (prev === null ? 0 : (g !== prev ? GAP[g] : 0)) + 0.23; prev = g; p.y = y;
      var r, mat;
      if (g === "w") { r = 1.55 - i * 0.08; mat = stdMat("--bad", { glow: 0.2, opacity: 0.85 }); }
      else if (g === "h") { r = 2.3; mat = stdMat("--muted", { glow: 0.15 }); }
      else if (g === "s1" || g === "s2" || g === "d") { r = g === "d" ? 1.45 : 1.15; mat = stdMat("--rupa-mark", { glow: 0.25, opacity: 0.9 }); }
      else if (g === "a") { r = 1.6; mat = null; }
      else if (g === "b4n") { r = 1.3; mat = stdMat("--rupa", { glow: 0.2 }); }
      else { r = 1.75; mat = stdMat("--nama-2", { glow: 0.22, opacity: 0.88 }); }
      if (g === "a") {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 80), stdMat("--nama", { glow: 0.35 })); ring.rotation.x = Math.PI / 2; ring.position.y = y; S.root.add(ring);
      } else if (g === "s1") {
        var ringK = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 10, 60), mat); ringK.rotation.x = Math.PI / 2; ringK.position.y = y; S.root.add(ringK); r = 1.02;
      } else {
        var disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.07, 64), mat); disc.position.y = y; S.root.add(disc);
      }
      yS[p[0]] = y;
      var side = i % 2 ? 1 : -1;
      /* leader line, fixed in the scene: from the disc's rim to the label column */
      var ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(side * (r + 0.05), y, 0), V(side * (LX - 0.05), y, 0)]), lineMat("--muted", 0.45)); S.scene.add(ln);
      var L = label(S, "<i>" + p[0] + "</i>" + (p[1] ? " · " + p[1] : ""), anchor(S, side * LX, y, 0, S.scene), "xs " + (side > 0 ? "right" : "left"), { pri: p[1] ? 4 : 2 });
      L.sh = p[3]; L.ln = ln; labs.push(L);
    });
    S.onSize = function (w) { labs.forEach(function (L) { var ph = w < 560; relabel(L, ph ? L.sh : L.html); L.hidden = ph && !L.sh; L.ln.visible = !L.hidden; }); };
    var hY = yS.Manussa, tY = yS["Tāvatiṃsa"];
    var cone = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.95, tY - hY, 40, 1), stdMat("--rupa", { glow: 0.12, opacity: 0.9 })); cone.position.y = (hY + tY) / 2; S.root.add(cone);
    label(S, "Mount Sineru", anchor(S, 0, (hY + tY) / 2 - 0.05, 1.05), "xs", { pri: 6 });
    var axis = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, y + 1, 8), basicMat("--line", 0.6)); axis.position.y = y / 2; S.root.add(axis);
    /* group names on chips, in front of their groups (woeful below its discs, so it never meets Mount Sineru) */
    [["woeful", P[0].y - 0.42, 1.2], ["sense heavens", (P[7].y + P[10].y) / 2, 1.6], ["fine-material", (P[14].y + P[19].y) / 2, 1.9], ["immaterial", (P[27].y + P[30].y) / 2, 1.75]].forEach(function (g) {
      var L = label(S, g[0].toUpperCase(), anchor(S, 0, g[1], g[2], S.scene), "cap3", { pri: 8 }); L.el.style.background = "color-mix(in srgb, var(--sheet) 85%, transparent)"; L.el.style.padding = "1px 5px";
    });
  })();

  /* ================= 11. D6: the climb (replaces the requisites skyline and the fetter column) =================
     Calm: stacked floors of absorption. Factor posts show which jhāna factors each floor keeps (a post ends on the
     last floor that has its factor); the immaterial floors are empty frames, as in D5, and the top of calm is still
     a plane of existence. Insight: a teal column beside the stack, fed by dashed links from any floor (or from the
     ground: dry insight), passing the insight knowledges and, above the top of calm, the four paths. The ten fetters
     are red rings set just under the path that cuts them; choosing a stage drops the rings that stage has cut.
     The 37 requisites, formerly a 3D bar chart, are drawn below as a 2D incidence table (14 states × 7 groups). */
  (function () {
    var G = [["Foundations of mindfulness", "Found.", 4], ["Right efforts", "Efforts", 4], ["Bases of success", "Bases", 4], ["Faculties", "Facult.", 5], ["Powers", "Powers", 5], ["Enlightenment factors", "Enlight.", 7], ["Path factors", "Path", 8]];
    var ST = [
      ["viriya", "energy", [0, 4, 1, 1, 1, 1, 1]], ["sati", "mindfulness", [4, 0, 0, 1, 1, 1, 1]], ["paññā", "wisdom", [0, 0, 1, 1, 1, 1, 1]], ["samādhi", "concentration", [0, 0, 0, 1, 1, 1, 1]], ["saddhā", "faith", [0, 0, 0, 1, 1, 0, 0]],
      ["chanda", "desire to act", [0, 0, 1, 0, 0, 0, 0]], ["citta", "consciousness", [0, 0, 1, 0, 0, 0, 0]], ["pīti", "zest", [0, 0, 0, 0, 0, 1, 0]], ["passaddhi", "tranquillity", [0, 0, 0, 0, 0, 1, 0]], ["upekkhā", "equanimity", [0, 0, 0, 0, 0, 1, 0]],
      ["vitakka", "right intention", [0, 0, 0, 0, 0, 0, 1]], ["sammā-vācā", "right speech", [0, 0, 0, 0, 0, 0, 1]], ["sammā-kammanta", "right action", [0, 0, 0, 0, 0, 0, 1]], ["sammā-ājīva", "right livelihood", [0, 0, 0, 0, 0, 0, 1]]
    ];
    (function table() {
      var host = $("d6-req"); if (!host) return;
      var LW = 168, CW = 34, RH = 15.5, TOP = 34, W = LW + 7 * CW + 34, Hh = TOP + ST.length * RH + 6, o = [];
      o.push('<svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="The 37 requisites as 14 states in 7 groups">');
      G.forEach(function (g, j) {
        var x = LW + j * CW + CW / 2;
        o.push('<text x="' + x + '" y="12" text-anchor="middle" font-size="9" fill="var(--muted)"><title>' + g[0] + "</title>" + g[1] + '</text><text x="' + x + '" y="25" text-anchor="middle" font-size="9" font-weight="600">' + g[2] + "</text>");
      });
      o.push('<text x="' + (LW + 7 * CW + 17) + '" y="25" text-anchor="middle" font-size="9" font-weight="600">×</text>');
      ST.forEach(function (st, i) {
        var y = TOP + i * RH + RH / 2, tot = st[2].reduce(function (a, b) { return a + b; }, 0);
        if (i % 2 === 0) o.push('<rect x="0" y="' + (y - RH / 2) + '" width="' + W + '" height="' + RH + '" fill="var(--faint)"/>');
        o.push('<text x="4" y="' + (y + 3.3) + '" font-size="9.5"><tspan font-style="italic" font-family="var(--body)" font-size="10.5">' + st[0] + '</tspan> <tspan fill="var(--muted)">' + st[1] + "</tspan></text>");
        st[2].forEach(function (n, j) {
          if (!n) return;
          var x = LW + j * CW + CW / 2;
          o.push('<circle cx="' + x + '" cy="' + y + '" r="' + (n > 1 ? 6.2 : 3.6) + '" fill="' + (st[0] === "citta" ? "var(--nama)" : "var(--nama-2)") + '"/>');
          if (n > 1) o.push('<text x="' + x + '" y="' + (y + 3.2) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--on-accent)">' + n + "</text>");
        });
        o.push('<text x="' + (LW + 7 * CW + 17) + '" y="' + (y + 3.3) + '" text-anchor="middle" font-size="9.5" font-weight="600">' + tot + "</text>");
      });
      o.push("</svg>");
      host.innerHTML = o.join("");
    })();

    var STAGES = [{ id: "0", label: "Ordinary person" }, { id: "1", label: "Stream-enterer" }, { id: "2", label: "Once-returner" }, { id: "3", label: "Non-returner" }, { id: "4", label: "Arahant" }];
    var CAP = { "0": "All ten fetters bind. The red rings sit just under the path that will cut them.", "1": "Stream-entry has cut personality view, doubt and clinging to rites and rules, for good.", "2": "Once-return cuts no new fetter: sensual desire and ill will remain, but weakened.", "3": "Non-return has cut sensual desire and ill will; five subtle fetters remain.", "4": "Arahantship has cut the last five. No fetter remains." };
    /* fetters: [name, cut at stage] (once-return, stage 2, weakens the two cut at 3) */
    var F = [["personality view", 1], ["doubt", 1], ["rites and rules", 1], ["sensual desire", 3], ["ill will", 3], ["lust for fine-material being", 4], ["lust for immaterial being", 4], ["conceit", 4], ["restlessness", 4], ["ignorance", 4]];
    var cur = "0";
    function caption() { if ($("d6-fet-cap")) $("d6-fet-cap").innerHTML = "<b>" + STAGES[+cur].label + ".</b> " + CAP[cur]; }
    var S = make3D("d6-climb", { height: 520, printHeight: 520, cam: [0, 4.2, 15.5], look: [0.3, 4.1, 0], fov: 34, sway: 0.3, rotY: -0.18, rotX: 0.04, phoneRatio: 1.25, fit: true, declutter: true });
    var rings = [], climber = null, PATHY = [0.3, 5.15, 5.85, 6.55, 7.25];
    function apply() {
      caption();
      if (!S) return;
      var st = +cur;
      rings.forEach(function (r) {
        var gone = st >= r.cut, weak = r.cut === 3 && st === 2;
        r.target = gone ? 0.12 : r.y0; r.fade = gone ? 0 : (weak ? 0.4 : 0.95); r.sc = weak ? 0.7 : 1;
        if (!S.anim) { r.m.position.y = r.target; r.m.material.opacity = r.fade; r.m.visible = r.fade > 0.02; r.m.scale.setScalar(r.sc); }
      });
      if (r0L) { r0L.forEach(function (x) { x.L.alpha = st >= x.cut ? 0.25 : 1; }); }
      climber.position.y = PATHY[st];
      S.dirty = true;
    }
    var r0L = null;
    pills($("d6-fet-btns"), STAGES, cur, function (v) { cur = v; S && (S.anim = true); apply(); });
    if (!S) { caption(); return; }
    var R = S.root, CX = -1.3, IX = 1.6;
    var ground = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.08, 2.6), basicMat("--line", 0.6)); ground.position.set(0.2, -0.04, 0); R.add(ground);
    label(S, "virtue: the ground", anchor(S, -2.75, 0.02, 1.15), "xs left", { pri: 5 });
    /* calm: floors */
    var FL = [["access", 0.55, "w"], ["1st jhāna", 1.05, "j"], ["2nd jhāna", 1.5, "j"], ["3rd jhāna", 1.95, "j"], ["4th jhāna", 2.4, "j"], ["5th jhāna", 2.85, "j"],
      ["infinite space", 3.35, "a"], ["infinite consciousness", 3.8, "a"], ["nothingness", 4.25, "a"], ["neither perception nor non-perception", 4.7, "a"]];
    var plateG = new THREE.BoxGeometry(2.6, 0.04, 2.0), plateE = new THREE.EdgesGeometry(plateG);
    FL.forEach(function (f, i) {
      if (f[2] === "j") { var pm = new THREE.Mesh(plateG, basicMat("--nama", 0.2 - i * 0.015)); pm.position.set(CX, f[1], 0); R.add(pm); }
      var e = new THREE.LineSegments(plateE, lineMat("--nama", f[2] === "w" ? 0.3 : f[2] === "a" ? 0.85 : 0.55)); e.position.set(CX, f[1], 0); R.add(e);
      label(S, f[0], anchor(S, CX - 1.4, f[1], 1.0), "xs left", { pri: 6, short: f[0].replace("neither perception nor non-perception", "neither-nor").replace("infinite consciousness", "inf. consciousness") });
      if (f[2] !== "w") { /* dashed link: any floor can be insight's base */
        var dl = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(CX + 1.3, f[1], 0), V(IX - 0.1, f[1] + 0.25, 0)]), new THREE.LineDashedMaterial({ color: col("--nib"), transparent: true, opacity: 0.55, dashSize: 0.1, gapSize: 0.08 }));
        dl.computeLineDistances(); R.add(dl); (function (m) { rethemers.push(function () { m.color.set(tok("--nib")); }); })(dl.material);
      }
    });
    label(S, "top of calm: still a plane of existence", anchor(S, CX - 1.4, 5.0, 1.0), "xs left", { pri: 4, minW: 560 });
    /* jhāna factor posts: [name, english, floors present (indices into FL), colour] */
    var FAC = [["vitakka", "initial application", [1], "--nama-2"], ["vicāra", "sustained application", [1, 2], "--nama-2"], ["pīti", "zest", [1, 2, 3], "--nama-2"],
      ["sukha", "happiness", [1, 2, 3, 4], "--f-joy"], ["upekkhā", "equanimity", [5, 6, 7, 8, 9], "--f-eq"], ["ekaggatā", "one-pointedness", [1, 2, 3, 4, 5, 6, 7, 8, 9], "--nama"]];
    var PX = [-2.35, -1.9, -1.45, -1.0, -1.0, -0.4], bead = new THREE.SphereGeometry(0.085, 16, 12);
    FAC.forEach(function (fc, k) {
      var x = PX[k], z = -0.7, m = stdMat(fc[3], { glow: 0.35 }), ys = fc[2].map(function (i) { return FL[i][1] + 0.09; });
      ys.forEach(function (yy) { var b = new THREE.Mesh(bead, m); b.position.set(x, yy, z); R.add(b); });
      if (ys.length > 1) { var post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, ys[ys.length - 1] - ys[0], 8), m); post.position.set(x, (ys[0] + ys[ys.length - 1]) / 2, z); R.add(post); }
      var ly = k === 4 ? ys[0] : ys[ys.length - 1], top = k === 5;
      label(S, "<i>" + fc[0] + "</i> · " + fc[1], anchor(S, x + (top ? -0.12 : 0.12), ly + 0.17, z), "xs " + (top ? "left" : "right"), { pri: 5, short: "<i>" + fc[0] + "</i>" });
    });
    /* insight column */
    var col0 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8.0, 16), stdMat("--nib", { glow: 0.35, opacity: 0.9 })); col0.position.set(IX, 4.0, 0); R.add(col0);
    label(S, "dry insight: momentary concentration", anchor(S, IX + 0.2, 0.3, 0), "xs right", { pri: 4, short: "dry insight" });
    var KN = [["view: mind and matter discerned", 1.0], ["overcoming doubt: their conditions", 1.55], ["comprehension", 2.1], ["rise and fall", 2.65], ["dissolution … reflection", 3.2], ["equanimity about formations", 3.75], ["conformity · change of lineage", 4.3]];
    var kb = stdMat("--nib", { glow: 0.3 });
    KN.forEach(function (k) { var b = new THREE.Mesh(bead, kb); b.position.set(IX, k[1], 0); R.add(b); label(S, k[0], anchor(S, IX + 0.2, k[1], 0), "xs right", { pri: 3, minW: 400 }); });
    ["stream-entry", "once-return", "non-return", "arahantship"].forEach(function (n, i) {
      var d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40), stdMat("--nib", { glow: 0.4 })); d.position.set(IX, PATHY[i + 1], 0); R.add(d);
      label(S, "<b>" + n + "</b>", anchor(S, IX + 0.5, PATHY[i + 1], 0), "sm2 right", { pri: 8 });
    });
    var orb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 22), stdMat("--nib", { glow: 0.6 })); orb.position.set(IX, 8.25, 0); R.add(orb);
    label(S, "Nibbāna: the object of every path", anchor(S, IX, 8.8, 0), "p", { pri: 9, short: "Nibbāna" });
    climber = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), stdMat("--ink", { glow: 0.2 })); climber.position.set(IX + 0.32, 0.3, 0.25); R.add(climber);
    /* fetter rings, red, just under the path that cuts them */
    var RY = { 0: 4.82, 1: 4.92, 2: 5.02, 3: 6.27, 4: 6.38, 5: 6.82, 6: 6.9, 7: 6.98, 8: 7.06, 9: 7.14 };
    var ringG = new THREE.TorusGeometry(0.27, 0.035, 10, 40);
    F.forEach(function (f, i) {
      var m = new THREE.Mesh(ringG, stdMat("--bad", { glow: 0.3, opacity: 0.95 })); m.rotation.x = Math.PI / 2; m.position.set(IX, RY[i], 0); m.material.transparent = true; R.add(m);
      rings.push({ m: m, cut: f[1], y0: RY[i], target: RY[i], fade: 0.95, sc: 1 });
    });
    r0L = [["personality view · doubt · rites and rules", 4.86, 1, 1], ["sensual desire · ill will", 6.32, 3, 0], ["lust for fine-material and immaterial being ·<br>conceit · restlessness · ignorance", 6.98, 4, 0]].map(function (g) {
      return { L: label(S, g[0], anchor(S, g[3] ? IX + 0.4 : IX - 0.4, g[1], 0), "xs " + (g[3] ? "right" : "left"), { pri: 7, short: ["3 fetters", "2 fetters", "5 fetters"][g[2] === 1 ? 0 : g[2] === 3 ? 1 : 2] }), cut: g[2] };
    });
    r0L.forEach(function (x) { x.L.el.style.color = "var(--bad)"; });
    S.update = function (dt) {
      if (!S.anim || !dt) return;
      var moving = false;
      rings.forEach(function (r) {
        var m = r.m, dy = r.target - m.position.y, dop = r.fade - m.material.opacity;
        if (Math.abs(dy) > 0.005 || Math.abs(dop) > 0.01) { moving = true; m.position.y += dy * Math.min(1, dt * 3); m.material.opacity += dop * Math.min(1, dt * 3); m.rotation.z += dt * 2 * (r.target < r.y0 ? 1 : 0); }
        m.scale.setScalar(r.sc); m.visible = m.material.opacity > 0.02;
      });
      if (!moving) S.anim = false;
    };
    S.beforePrint = function () { cur = "0"; setPressed($("d6-fet-btns"), "0"); S.anim = false; apply(); };
    apply();
  })();

  /* ================= 13. D7: one moment, every lens (replaces "the weave") =================
     The mango moment (seeing a ripe mango and wanting it) as five transparent layers on one time axis of 17
     mind-moments: matter (the mango's colour, eye-sensitivity, mind-born matter), citta, factors (stacked by kind:
     universal, occasional, beautiful, unwholesome), conditions (proximity and repetition along the layer; object,
     prenascence and kamma as threads between layers) and kamma (results arriving at the resultant cittas, new kamma
     made at the javanas, sent to three different futures). A cursor cuts all five layers at one moment; the caption
     reads the cut lens by lens. Counts: research data (CMA II rules); javana effectiveness: CMA V. */
  (function () {
    var MO = ["bh", "vb", "ar", "pa", "vi", "sa", "st", "vo", "ja", "ja", "ja", "ja", "ja", "ja", "ja", "ta", "ta"];
    /* factors per moment: [universal, occasional, beautiful, unwholesome, may-join] (Plate 3 numbers in the caption) */
    var FX = { bh: [7, 6, 20, 0, 0], vb: [7, 6, 20, 0, 0], ar: [7, 6, 20, 0, 0], pa: [7, 3, 0, 0, 0], vi: [7, 0, 0, 0, 0], sa: [7, 3, 0, 0, 0], st: [7, 4, 0, 0, 0], vo: [7, 4, 0, 0, 0], ja: [7, 6, 0, 5, 1], ta: [7, 4, 0, 0, 0] };
    var RES = { bh: 1, vb: 1, ar: 1, vi: 1, sa: 1, st: 1, ta: 1 };
    var H = { bh: 0.18, vb: 0.26, ar: 0.26, pa: 0.5, vi: 0.62, sa: 0.5, st: 0.5, vo: 0.5, ja: 0.95, ta: 0.42 };
    var CO = { bh: "--line", vb: "--muted", ar: "--muted", pa: "--nama-2", vi: "--nama", sa: "--nama-2", st: "--nama-2", vo: "--nama-2", ja: "--nama", ta: "--nama-2" };
    var CUTS = [
      { id: "4", label: "Seeing", t: ["Seeing (Plate 3, citta 20): wholesome-resultant eye-consciousness.", "Only the 7 universals.", "The colour is in its 5th moment; eye-sensitivity is the base. Seeing alone makes no mind-born matter.", "Prenascence from the eye-base, object from the colour, proximity from adverting.", "A result of past wholesome kamma; it makes none."] },
      { id: "7", label: "Determining", t: ["Determining (citta 29), a functional citta.", "11: the universals, applied and sustained thought, decision and energy.", "Colour in its 8th moment.", "Proximity from investigating. Here the course turns: what the javanas become depends on attention (the commentaries).", "Neither result nor kamma."] },
      { id: "8", label: "Javana 1", t: ["The first javana: greed-rooted, joyful, without wrong view (citta 3): wanting what is seen. “A mango” is known in the mind-door processes that follow.", "18, or 19 if conceit joins: 13 ethically variable, then delusion, shamelessness, fearlessness of wrong, restlessness and greed (red).", "Colour in its 9th moment; the javana makes mind-born matter.", "Proximity from determining; repetition to the next javana.", "Its volition is kamma, and the first javana's can ripen only in this life."] },
      { id: "14", label: "Javana 7", t: ["The seventh javana, the same citta.", "The same 18 or 19.", "Colour in its 15th moment.", "Proximity and repetition from javana 6.", "The seventh javana's kamma ripens in the next life or not at all; the five between can ripen in any life after the next, while the round goes on."] },
      { id: "15", label: "Registration", t: ["Registration (citta 26): resultant, holding the javanas' object.", "11, with zest: the object is very pleasing.", "Colour in its 16th moment; one more, and the object ceases.", "Proximity from the last javana; then the life-continuum resumes.", "A result again: the course of kamma for this moment is done."] }
    ];
    var cur = "8", LN = ["Citta", "Factors", "Matter", "Conditions", "Kamma"];
    function caption() {
      var c = CUTS.filter(function (x) { return x.id === cur; })[0], box = $("d7-cap"); if (!box) return;
      box.innerHTML = "<b>The cut at " + c.label.toLowerCase() + ".</b> " + c.t.map(function (x, i) { return "<b>" + LN[i] + ":</b> " + x; }).join(" ");
    }
    pills($("d7-btns"), CUTS, cur, function (v) { cur = v; caption(); place(); });
    caption();
    var S = make3D("d7-view", { height: 440, printHeight: 450, cam: [0, 6.6, 12.8], look: [0.2, 2.6, 0], fov: 34, sway: 0.25, rotY: -0.12, rotX: 0.02, phoneRatio: 0.66, fit: true, declutter: true });
    var cutM = null;
    function place() { if (!S) return; cutM.position.x = X(+cur); S.dirty = true; }
    if (!S) return;
    var R = S.root, STEP = 0.52, X0 = -((MO.length - 1) * STEP) / 2, LY = { m: 0, c: 1.3, f: 2.6, k: 3.9, km: 5.2 }, SW = MO.length * STEP + 0.7;
    function X(i) { return X0 + i * STEP; }
    [["m", "--rupa-mark", "MATTER"], ["c", "--nama", "CITTA"], ["f", "--nama-2", "FACTORS"], ["k", "--g6", "CONDITIONS"], ["km", "--kamma", "KAMMA"]].forEach(function (L) {
      var g = new THREE.BoxGeometry(SW, 0.02, 1.5), sh = new THREE.Mesh(g, basicMat(L[1], 0.08)); sh.position.set(0, LY[L[0]] - 0.02, 0); R.add(sh);
      var e = new THREE.LineSegments(new THREE.EdgesGeometry(g), lineMat(L[1], 0.45)); e.position.copy(sh.position); R.add(e);
      label(S, L[2], anchor(S, -SW / 2 - 0.1, LY[L[0]], 0.75), "cap3 left", { pri: 9 });
    });
    /* matter */
    var bar = new THREE.Mesh(new THREE.BoxGeometry(MO.length * STEP - 0.06, 0.1, 0.22), stdMat("--rupa-mark", { glow: 0.35 })); bar.position.set(0, LY.m + 0.05, 0.42); R.add(bar);
    label(S, "the mango's colour: 17 moments", anchor(S, X(2), LY.m + 0.1, 0.62), "xs", { pri: 6, short: "colour · 17 moments" });
    var eye = new THREE.Mesh(new THREE.BoxGeometry(MO.length * STEP + 0.4, 0.1, 0.18), stdMat("--rupa", { glow: 0.25 })); eye.position.set(-0.2, LY.m + 0.05, 0.02); R.add(eye);
    label(S, "eye-sensitivity (arose before)", anchor(S, X(14), LY.m + 0.12, 0.1), "xs", { pri: 4, minW: 560 });
    var mbG = new THREE.BoxGeometry(0.1, 0.1, 0.1), mbM = stdMat("--nama", { glow: 0.2, opacity: 0.85 });
    MO.forEach(function (c, i) { if (c === "vi") return; var mb = new THREE.Mesh(mbG, mbM); mb.position.set(X(i), LY.m + 0.06, -0.42); R.add(mb); });
    label(S, "mind-born matter", anchor(S, X(10), LY.m + 0.12, -0.42), "xs", { pri: 3, minW: 560 });
    /* citta */
    var cm = {};
    MO.forEach(function (c, i) {
      var h = H[c], k = c === "vi" ? "vi" : CO[c];
      if (!cm[k]) cm[k] = c === "vi" ? stdMat("--nama", { glow: 0.2, opacity: 0.18 }) : stdMat(CO[c], { glow: 0.25, opacity: c === "bh" ? 0.6 : undefined });
      var m = new THREE.Mesh(new THREE.BoxGeometry(0.36, h, 0.42), cm[k]); m.position.set(X(i), LY.c + h / 2, 0); R.add(m);
      if (c === "vi") m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lineMat("--nama", 0.95)));
    });
    [["bhavaṅga", 1], ["adverting", 3], ["seeing", 4], ["javana ×7", 11], ["registration", 15.5]].forEach(function (n, j) {
      label(S, n[0], anchor(S, X(n[1]), LY.c - 0.12, 0.75), "xs", { pri: 5, short: n[0] === "registration" ? "reg." : n[0] === "adverting" ? "adv." : null });
    });
    /* factors: one stacked column per moment */
    var U = 0.024, fm = { u: stdMat("--nama", { glow: 0.3 }), o: stdMat("--nama-2", { glow: 0.3 }), b: stdMat("--nama", { glow: 0.2, opacity: 0.4 }), a: stdMat("--bad", { glow: 0.3 }), v: stdMat("--bad", { glow: 0.2, opacity: 0.3 }) };
    MO.forEach(function (c, i) {
      var y = LY.f, f = FX[c];
      [["u", f[0]], ["o", f[1]], ["b", f[2]], ["a", f[3]], ["v", f[4]]].forEach(function (seg) {
        if (!seg[1]) return;
        var h = seg[1] * U, m = new THREE.Mesh(new THREE.BoxGeometry(0.3, h - 0.006, 0.3), fm[seg[0]]); m.position.set(X(i), y + h / 2, 0); R.add(m); y += h;
      });
    });
    [["33", 1, 33], ["7", 4, 7], ["18 (+1)", 11, 19], ["11", 15.5, 11]].forEach(function (n) { label(S, n[0], anchor(S, X(n[1]), LY.f + n[2] * U + 0.14, 0), "xs", { pri: 4 }); });
    /* conditions: proximity chevrons along the layer, repetition arcs over the javanas */
    var cone = new THREE.ConeGeometry(0.05, 0.14, 10), pm = stdMat("--g1", { glow: 0.3 });
    for (var i = 0; i < MO.length - 1; i++) { var ch = new THREE.Mesh(cone, pm); ch.rotation.z = -Math.PI / 2; ch.position.set(X(i) + STEP / 2, LY.k + 0.08, 0.3); R.add(ch); }
    label(S, "proximity: each citta → the next", anchor(S, X(4), LY.k + 0.12, 0.62), "xs", { pri: 5, short: "proximity" });
    for (i = 8; i < 14; i++) R.add(tube([V(X(i), LY.k + 0.05, -0.2), V(X(i) + STEP / 2, LY.k + 0.45, -0.2), V(X(i + 1), LY.k + 0.05, -0.2)], 0.02, basicMat("--g1", 0.8)));
    label(S, "repetition", anchor(S, X(11), LY.k + 0.5, -0.2), "xs", { pri: 5 });
    /* threads between layers: object (colour → each process citta), prenascence (eye-base → seeing), kamma (javana → kamma layer) */
    function thread(x, y0, y1, z, c, op) { var t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, y1 - y0, 6), basicMat(c, op)); t.position.set(x, (y0 + y1) / 2, z); R.add(t); }
    for (i = 3; i < MO.length; i++) thread(X(i) + 0.08, LY.m + 0.1, LY.c, 0.42, "--g5", 0.6);
    label(S, "object", anchor(S, X(5.5) + 0.08, (LY.m + LY.c) / 2 + 0.1, 0.42), "xs", { pri: 4 });
    thread(X(4) - 0.08, LY.m + 0.1, LY.c, 0.02, "--g4", 0.9);
    label(S, "prenascence", anchor(S, X(4) - 0.15, (LY.m + LY.c) / 2 - 0.15, 0.02), "xs left", { pri: 4, minW: 560 });
    for (i = 8; i < 15; i++) thread(X(i), LY.f + 19 * U, LY.km, 0, "--kamma", 0.55);
    /* kamma: results arriving at the resultant cittas, new kamma made at the javanas */
    var dn = new THREE.ConeGeometry(0.08, 0.2, 12), dm = stdMat("--kamma", { glow: 0.3, opacity: 0.55 }), sm = stdMat("--kamma", { glow: 0.55 }), seed = new THREE.OctahedronGeometry(0.11);
    MO.forEach(function (c, i) {
      if (RES[c]) { var m = new THREE.Mesh(dn, dm); m.rotation.x = Math.PI; m.position.set(X(i), LY.km + 0.14, 0); R.add(m); }
      if (c === "ja") { var sd = new THREE.Mesh(seed, sm); sd.position.set(X(i), LY.km + 0.16, 0); R.add(sd); }
    });
    label(S, "results of past kamma arrive", anchor(S, X(2), LY.km + 0.42, 0), "xs", { pri: 5, short: "results" });
    label(S, "new kamma made", anchor(S, X(11), LY.km + 0.48, 0), "xs", { pri: 5, short: "new kamma" });
    [[8, 1.05, "this life only", "this life"], [11, 0.7, "lives after the next", "after next"], [14, 0.35, "the next life", "next life"]].forEach(function (k) {
      var a = V(X(k[0]), LY.km + 0.22, 0), e = V(SW / 2 + 0.55, LY.km + k[1], 0);
      R.add(tube([a, V((a.x + e.x) / 2, e.y + 0.25, 0), e], 0.018, basicMat("--kamma", 0.75)));
      var tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), sm); tip.position.copy(e); R.add(tip);
      label(S, k[2], anchor(S, e.x + 0.1, e.y, 0), "xs right", { pri: 7, short: k[3] });
    });
    /* the cut */
    var cg = new THREE.BoxGeometry(STEP * 0.9, LY.km + 0.9, 1.7);
    cutM = new THREE.Mesh(cg, basicMat("--ink", 0.06)); cutM.position.set(0, (LY.km + 0.9) / 2 - 0.15, 0); cutM.userData.nofit = true; R.add(cutM);
    cutM.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg), lineMat("--ink", 0.35)));
    S.beforePrint = function () { cur = "8"; setPressed($("d7-btns"), "8"); caption(); place(); };
    place();
  })();

  if (scenes.length) requestAnimationFrame(loop);
})();
