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

  /* ---------------- toolkit ---------------- */
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
      touched: false, sway: o.sway || 0, spin: o.spin || 0, baseY: o.rotY || 0, baseX: o.rotX || 0, t: 0, dirty: true, w: 0, h: 0 };
    root.rotation.set(S.baseX, S.baseY, 0);
    S.size = function () {
      var w = host.clientWidth || 640, h = o.heightFn ? o.heightFn(w) : (w < 560 ? Math.round(w * (o.phoneRatio || 0.9)) : o.height);
      if (w === S.w && h === S.h) return;
      S.w = w; S.h = h;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      var f = Math.max(1, refA / (w / h));
      camera.position.copy(look).add(camBase.clone().multiplyScalar(f)); camera.lookAt(look);
      S.dirty = true;
    };
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
  function label(S, html, obj, cls) {
    var el = document.createElement("span"); el.className = "lbl3 " + (cls || ""); el.innerHTML = html; S.overlay.appendChild(el);
    var L = { el: el, obj: obj, alpha: 1, hidden: false }; S.labels.push(L); return L;
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
  function setPressed(host, v) { if (host) Array.prototype.forEach.call(host.children, function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-v") === v)); }); }

  var tmpV = HAS3 ? new THREE.Vector3() : null;
  function draw(S) {
    var r = renderer(), W = S.cv.width, H = S.cv.height, c = r.domElement;
    if (c.width < W || c.height < H) r.setSize(Math.max(c.width, W), Math.max(c.height, H), false);
    r.setViewport(0, 0, W, H); r.setScissor(0, 0, W, H); r.setScissorTest(true);
    r.setClearColor(0x000000, 0); r.clear();
    r.render(S.scene, S.camera);
    S.ctx.clearRect(0, 0, W, H);
    S.ctx.drawImage(c, 0, c.height - H, W, H, 0, 0, W, H);
    S.labels.forEach(function (L) {
      L.obj.getWorldPosition(tmpV); tmpV.project(S.camera);
      var x = (tmpV.x * 0.5 + 0.5) * S.w, y = (-tmpV.y * 0.5 + 0.5) * S.h;
      var shift = L.el.classList.contains("left") ? "-100%" : (L.el.classList.contains("right") ? "0%" : "-50%");
      L.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(" + shift + ",-50%)";
      L.el.style.opacity = (L.hidden || tmpV.z > 1) ? 0 : L.alpha;
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
      S.root.rotation.set(S.baseX, S.baseY + (S.printY || 0), 0);
      if (S.beforePrint) S.beforePrint();
      if (S.update) S.update(0, S.t);
      draw(S);
    });
    return scenes.length;
  };
  function retheme() { setTimeout(function () { rethemers.forEach(function (f) { f(); }); scenes.forEach(function (S) { S.dirty = true; }); }, 30); }
  if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", retheme); }
  if (window.MutationObserver) new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ================= 1. Interconnection map =================
     Ideas, links and loops come from data.js. The 2D map (maps.js) sends "atlas:select"
     events, so choosing an idea or tracing a path there lights the same thing up here. */
  function xr(n) { return '<a class="xr" href="#p' + n + '">→ ' + n + "</a>"; }
  (function () {
    var D = window.ATLAS, IDEAS = D.ideas, LINKS = D.links, LTYPE = D.linkTypes, LOOPS = D.loops;
    var byId = {}; IDEAS.forEach(function (n) { byId[n.id] = n; });
    var S = make3D("m3-view", { height: 455, cam: [0, 2.4, 14.6], look: [0, 0.2, 0], fov: 36, sway: 0.5, rotX: 0.05, refAspect: 1.3, phoneRatio: 1.15 });
    if (!S) return;
    var Y = { 1: -3.1, 2: -1.8, 3: -0.5, 4: 0.8, 5: 2.1, 6: 3.4 }, RAD = 2.9;
    for (var lv = 2; lv <= 6; lv++) {
      var disc = new THREE.Mesh(new THREE.CircleGeometry(RAD + 0.4, 64), basicMat("--lv" + lv, 0.07)); disc.rotation.x = -Math.PI / 2; disc.position.y = Y[lv] - 0.02; S.root.add(disc);
      var rim = new THREE.Mesh(new THREE.TorusGeometry(RAD + 0.4, 0.008, 6, 120), basicMat("--lv" + lv, 0.45)); rim.rotation.x = Math.PI / 2; rim.position.y = Y[lv] - 0.02; S.root.add(rim);
      label(S, ["", "I", "II", "III", "IV", "V", "VI"][lv], anchor(S, RAD + 0.75, Y[lv], 0), "sm");
    }
    var base = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), basicMat("--lv1", 0.12)); base.rotation.x = -Math.PI / 2; base.position.y = Y[1] - 0.02; S.root.add(base);
    label(S, "I", anchor(S, 1.1, Y[1], 0), "sm");
    var meshes = [], pos = {}, labs = {};
    IDEAS.forEach(function (n) {
      var r = n.orbit === null ? 0 : RAD, a = (n.orbit || 0) * Math.PI / 180;
      var p = V(r * Math.cos(a), Y[n.lv], r * Math.sin(a)); pos[n.id] = p;
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.24, 28, 20), stdMat(n.c, { glow: 0.3 })); m.position.copy(p); m.userData.id = n.id; S.root.add(m); meshes.push(m);
      labs[n.id] = label(S, n.t, anchor(S, p.x, p.y + 0.42, p.z), "nd");
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
      var L = label(S, l.label, anchor(S, c.getPoint(0.5).x, c.getPoint(0.5).y, c.getPoint(0.5).z), "sm el"); L.hidden = true;
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

  /* ================= 2. D1: categories ================= */
  (function () {
    var S = make3D("d1-view", { height: 470, cam: [0, 6.6, 10.2], look: [0.1, 2.1, 0], fov: 36, sway: 0.32, rotX: 0.02, refAspect: 1.4, phoneRatio: 1.05 });
    var PIL = { ci: [-3.0, 1.5, "--nama", "citta · 89"], ce: [-1.25, 1.5, "--nama-2", "cetasika · 52"], ru: [1.0, 2.5, "--rupa-mark", "rūpa · 28"], nb: [3.05, 1.0, "--nib", "Nibbāna · 1"] };
    var SH = [["agg", 0.9, "--g2", "5 aggregates"], ["bas", 1.95, "--g4", "12 bases"], ["ele", 3.0, "--g5", "18 elements"], ["tru", 4.05, "--g3", "4 noble truths"]];
    var ZR = { f: 0.56, m: 0, b: -0.58 };
    var RU = ["eye", "ear", "nose", "tongue", "body"], OB = ["form", "sound", "smell", "taste", "touch"];
    var T = [
      ["agg", ["ru"], "f", "rūpa"], ["agg", ["ce"], "f", "feeling"], ["agg", ["ce"], "m", "perception"], ["agg", ["ce"], "b", "formations"], ["agg", ["ci"], "f", "consciousness"],
      ["bas", ["ci"], "f", "mind base"], ["bas", ["ce", "ru", "nb"], "b", "mental-object base"],
      ["ele", ["ci"], "f", "5 sense-consc. · 10"], ["ele", ["ci"], "m", "mind el. · 3"], ["ele", ["ci"], "b", "mind-consc. el. · 76"], ["ele", ["ce", "ru", "nb"], "b", "mental-object element"],
      ["tru", ["ci", "ce", "ru"], "f", "suffering · all that is mundane"], ["tru", ["ce"], "m", "origin · craving"], ["tru", ["ce"], "b", "path · 8 factors"], ["tru", ["nb"], "f", "cessation"]
    ];
    ["bas", "ele"].forEach(function (sh) {
      RU.forEach(function (n, i) { T.push([sh, ["ru"], "f", n, i]); });
      OB.forEach(function (n, i) { T.push([sh, ["ru"], "m", n, i]); });
    });
    var cur = "all";
    pills($("d1-btns"), [{ id: "all", label: "All four lists" }].concat(SH.map(function (s) { return { id: s[0], label: s[3], c: s[2] }; })), cur, function (v) { cur = v; apply(); });
    if (!S) return;
    var mats = {}, objs = [];
    Object.keys(PIL).forEach(function (k) {
      var p = PIL[k];
      var glass = new THREE.Mesh(new THREE.BoxGeometry(p[1], 4.5, 1.7), basicMat(p[2], 0.07)); glass.position.set(p[0], 2.25, 0); S.root.add(glass);
      var edgesM = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(p[1], 4.5, 1.7)), lineMat(p[2], 0.35)); edgesM.position.copy(glass.position); S.root.add(edgesM);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(p[1], 0.45, 1.7), stdMat(p[2], { glow: 0.3 })); foot.position.set(p[0], -0.22, 0); S.root.add(foot);
      label(S, p[3], anchor(S, p[0], -0.7, 0.9), "p");
    });
    SH.forEach(function (sh) {
      var plate = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.02, 1.9), basicMat(sh[2], 0.06)); plate.position.set(0.2, sh[1] - 0.14, 0); S.root.add(plate);
      label(S, sh[3], anchor(S, -3.95, sh[1], 0.9), "sm left");
      mats[sh[0]] = { on: stdMat(sh[2], { glow: 0.3, opacity: 0.92 }), off: basicMat(sh[2], 0.1) };
    });
    T.forEach(function (t) {
      var sh = SH.filter(function (s) { return s[0] === t[0]; })[0];
      var left = Infinity, right = -Infinity;
      t[1].forEach(function (k) { var p = PIL[k]; left = Math.min(left, p[0] - p[1] / 2); right = Math.max(right, p[0] + p[1] / 2); });
      var x0 = left + 0.08, x1 = right - 0.08, w;
      if (t[4] != null) { var cw = (x1 - x0) / 5; w = cw - 0.06; x0 = x0 + t[4] * cw + 0.03; x1 = x0 + w; } else w = x1 - x0;
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 0.42), mats[t[0]].on);
      m.position.set((x0 + x1) / 2, sh[1], ZR[t[2]]); m.userData.sh = t[0]; S.root.add(m); objs.push(m);
      var L = label(S, t[3], anchor(S, (x0 + x1) / 2, sh[1] + 0.2, ZR[t[2]] + 0.2), t[4] != null ? "xs" : "sm2");
      L.sh = t[0]; m.userData.L = L;
    });
    function apply() {
      objs.forEach(function (m) {
        var on = cur === "all" || cur === m.userData.sh;
        m.material = on ? mats[m.userData.sh].on : mats[m.userData.sh].off;
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
    var mode = "feel";
    pills($("d2-tower-btns"), [{ id: "feel", label: "Colour by feeling" }, { id: "kind", label: "Colour by kind" }], mode, function (v) { mode = v; apply(); });
    var S = make3D("d2-tower", { height: 300, cam: [0, 3.4, 8.4], look: [0, 1.15, 0], fov: 34, spin: 0.16, rotX: 0.05, refAspect: 1.9, phoneRatio: 0.9 });
    if (!S) return;
    var mats = {}, cubes = [];
    function mat(v, op) { var key = v + (op || ""); if (!mats[key]) mats[key] = stdMat(v, { glow: 0.25, opacity: op }); return mats[key]; }
    tiers.forEach(function (t) {
      var n = t.f.length;
      var plat = new THREE.Mesh(new THREE.CylinderGeometry(t.r + 0.25, t.r + 0.4, 0.12, 64), basicMat("--line", 0.5)); plat.position.y = t.y - 0.18; S.root.add(plat);
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2, c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2));
        c.position.set(Math.cos(a) * t.r, t.y, Math.sin(a) * t.r); c.rotation.y = -a; c.userData = { f: t.f[i], k: t.k[i] }; S.root.add(c); cubes.push(c);
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
    var cur = "greed", S = make3D("d2-ceta", { height: 290, cam: [0, 0.9, 9.6], look: [0, 0, 0], fov: 36, sway: 0.5, rotX: 0.18, refAspect: 1.0, phoneRatio: 0.9 });
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
      { id: "heart", label: "Heart decad", a: ["life", "heart"], d: "Kamma-born: the base of all cittas except the sense consciousnesses." },
      { id: "oct", label: "Pure octad", a: [], d: "The eight inseparables alone: the smallest possible group of matter." },
      { id: "tri", label: "Speech", a: ["vint", "sound", "m1", "m2", "m3"], d: "Mind-born tridecad: vocal intimation, sound and the three mutable qualities, thirteen members in all." }
    ];
    var cur = "eye", S = make3D("d2-kal", { height: 290, cam: [0, 1.1, 9.6], look: [0, -0.05, 0], fov: 36, spin: 0.22, rotX: 0.32, rotY: 0.6, refAspect: 1.0, phoneRatio: 0.9 });
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
      m.position.set(o[3][0] * 0.95, o[3][1] * 0.95, o[3][2] * 0.95); R.add(m); label(S, '<i class="p">' + o[0] + "</i>", m, "xs");
    });
    R.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 1.9, 1.9)), lineMat("--muted", 0.55)));
    Object.keys(ADD).forEach(function (k) {
      var a = ADD[k], m = new THREE.Mesh(new THREE.SphereGeometry(k === "life" ? 0.26 : 0.22, 26, 18), stdMat(a[2], { glow: 0.35 }));
      m.position.set(a[3][0], a[3][1], a[3][2]); R.add(m);
      var L = label(S, '<i class="p">' + a[0] + "</i>", m, "xs");
      var sp = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), m.position.clone()]), lineMat(a[2], 0.6)); R.add(sp);
      nodes[k] = { m: m, L: L, sp: sp };
    });
    show(cur);
  })();

  /* ================= 6. D3: process track ================= */
  (function () {
    var STR = [
      { id: "vgreat", label: "Very great", s: "a bh bu pa vi sa st vo ja ja ja ja ja ja ja ta ta" },
      { id: "great", label: "Great", s: "a a a bh bu pa vi sa st vo ja ja ja ja ja ja ja" },
      { id: "slight", label: "Slight", s: "a a a a a bh bu pa vi sa st vo vo vo b b b" },
      { id: "vslight", label: "Very slight", s: "a a a a a a a a a a a a bh bh b b b" },
      { id: "mind", label: "Mind door", s: "bh bu ma ja ja ja ja ja ja ja ta ta" }
    ];
    var KIND = { a: ["bh", "past"], b: ["bh", "bhavaṅga"], bh: ["bh2", "vibrating"], bu: ["bh2", "arrest"], pa: ["pr", "adverting"], ma: ["pr", "adverting"], vi: ["vi", "seeing"], sa: ["pr", "receiving"], st: ["pr", "investigating"], vo: ["pr", "determining"], ja: ["ja", "javana"], ta: ["ta", "registration"] };
    var H = { bh: 0.18, bh2: 0.26, pr: 0.5, vi: 0.62, ja: 0.95, ta: 0.42 };
    var CO = { bh: "--line", bh2: "--muted", pr: "--nama-2", vi: "--rupa", ja: "--nama", ta: "--nama-2" };
    var cur = "vgreat";
    var S = make3D("d3-proc", { height: 270, cam: [0, 2.2, 7.3], look: [0, 0.55, 0], fov: 34, sway: 0.28, rotX: 0.04, refAspect: 2.3, phoneRatio: 0.8 });
    var group = null, seeds = [], objBar = null;
    function build() {
      if (!S) return;
      if (group) S.root.remove(group);
      group = new THREE.Group(); S.root.add(group); seeds = [];
      S.labels = S.labels.filter(function (L) { if (L.tmp) { L.el.remove(); return false; } return true; });
      var codes = STR.filter(function (x) { return x.id === cur; })[0].s.split(" "), n = codes.length, step = 0.48, x0 = -((n - 1) * step) / 2;
      var shown = {};
      codes.forEach(function (c, i) {
        var k = KIND[c][0], h = H[k], x = x0 + i * step;
        var m = new THREE.Mesh(new THREE.BoxGeometry(0.38, h, 0.5), stdMat(CO[k], { glow: 0.25, opacity: k === "bh" ? 0.6 : undefined })); m.position.set(x, h / 2, 0); group.add(m);
        if (k === "ja") {
          var sd = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), stdMat("--kamma", { glow: 0.5 })); sd.position.set(x, 1.15, 0); sd.userData.base = 1.15; sd.userData.ph = i * 0.6; group.add(sd); seeds.push(sd);
        }
        if (c !== "vi" && cur !== "vslight") {
          var mb = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), stdMat("--nama", { glow: 0.2, opacity: 0.85 })); mb.position.set(x, -0.32, 0.12); group.add(mb);
        }
        var name = KIND[c][1];
        if (!shown[name] && (c !== "ja" || !shown.javana)) {
          shown[name] = true;
          var nl = Object.keys(shown).length; var L = label(S, c === "ja" ? "javana ×7" : name, anchor(S, x + (c === "ja" ? 3 * step : 0), h + (c === "ja" ? 0.62 : (nl % 2 ? 0.2 : 0.48)), 0, group), "xs"); L.tmp = true;
        }
      });
      if (cur !== "mind") {
        var len = n * step - 0.08;
        objBar = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.3), stdMat("--rupa-mark", { glow: 0.35 })); objBar.position.set(0, 1.55, -0.1); group.add(objBar);
        var L2 = label(S, "the object: 17 moments of matter", anchor(S, 0, 1.78, -0.1, group), "sm"); L2.tmp = true;
      }
      var L3 = label(S, "mind-born matter", anchor(S, x0 - 0.6, -0.32, 0.12, group), "xs left"); L3.tmp = true;
      S.dirty = true;
    }
    pills($("d3-proc-btns"), STR, cur, function (v) { cur = v; build(); });
    if (!S) return;
    var floor = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.03, 1.1), basicMat("--line", 0.4)); floor.position.y = -0.02; S.root.add(floor);
    S.update = function (dt, t) { seeds.forEach(function (sd) { sd.position.y = sd.userData.base + (dt ? 0.12 * Math.sin(t * 2 + sd.userData.ph) : 0); sd.rotation.y = t; }); };
    build();
  })();

  /* ================= 7. D3: the loom of matter ================= */
  (function () {
    var MODES = [{ id: "birth", label: "Conception" }, { id: "life", label: "During life" }, { id: "death", label: "Approaching death" }];
    var TEXT = {
      birth: ["Conception.", "Kamma-born matter begins with the rebirth-linking citta; temperature-born at its presence phase; mind-born only with the first life-continuum; nutriment-born once nutriment is absorbed."],
      life: ["During life.", "Bright bars are alive at the moment marked “now”; faint ones have ceased. About 51 generations of kamma-born matter and 17 of mind-born matter are alive at once: the body is a standing wave of arising and ceasing."],
      death: ["Approaching death.", "From the seventeenth mind-moment before death, kamma makes no new matter, so its last units cease exactly at death. Mind-born and nutriment-born matter stop with death; temperature-born matter continues, as the corpse."]
    };
    var mode = "life", now = 60, WIN = 120, LIFE = 51, DEATH = 90;
    function text() { if ($("d3-loom-title")) { $("d3-loom-title").textContent = TEXT[mode][0]; $("d3-loom-text").textContent = TEXT[mode][1]; } }
    var S = make3D("d3-loom", { height: 300, cam: [0, 2.9, 11.6], look: [0, 2.45, 0], fov: 36, sway: 0.2, refAspect: 2.0, phoneRatio: 0.85 });
    var lanes = [
      { id: "kamma", c: "--kamma", y0: 3.7, h: 1.6, every: 1, mod: 51, label: "kamma-born" },
      { id: "mind", c: "--nama", y0: 2.4, h: 1.0, every: 3, mod: 17, label: "mind-born" },
      { id: "temp", c: "--temp", y0: 1.1, h: 1.0, every: 2, mod: 26, label: "temperature-born" },
      { id: "food", c: "--food", y0: 0, h: 0.8, every: 4, mod: 13, label: "nutriment-born" }
    ];
    var dx = 0.07, X0 = -WIN * dx / 2, units = [], discs = [], marks = {}, discMats, CY = -0.4, nowPlane;
    function arrivals(lane) {
      var out = [];
      for (var s = -LIFE + 1; s < WIN; s++) {
        if (((s % lane.every) + lane.every) % lane.every !== 0) continue;
        if (mode === "birth" && ((lane.id === "kamma" && s < 0) || (lane.id === "temp" && s < 1) || (lane.id === "mind" && s < 3) || (lane.id === "food" && s < 66))) continue;
        if (mode === "death" && ((lane.id === "kamma" && s >= DEATH - LIFE) || ((lane.id === "mind" || lane.id === "food") && s > DEATH))) continue;
        out.push(s);
      }
      return out;
    }
    function build() {
      text();
      if (!S) return;
      units.forEach(function (u) { S.root.remove(u.m); }); units = [];
      lanes.forEach(function (lane) {
        if (!lane.on) { lane.on = stdMat(lane.c, { glow: 0.45, opacity: 0.97 }); lane.off = basicMat(lane.c, 0.16); lane.geo = new THREE.BoxGeometry(1, 0.78 * lane.h / lane.mod, 0.3); }
        arrivals(lane).forEach(function (s) {
          var xs = Math.max(s, 0), xe = Math.min(s + LIFE, WIN); if (xe <= xs) return;
          var m = new THREE.Mesh(lane.geo, lane.off), layer = Math.floor(s / lane.every); layer = ((layer % lane.mod) + lane.mod) % lane.mod;
          m.scale.x = (xe - xs) * dx; m.position.set(X0 + (xs + (xe - xs) / 2) * dx, lane.y0 + (layer + 0.5) * (lane.h / lane.mod), 0); m.visible = false; S.root.add(m);
          units.push({ m: m, s: s, lane: lane });
        });
      });
      discs.forEach(function (d, k) {
        var sp = (mode === "birth" && k === 0) ? "birth" : (mode === "death" && k === DEATH / 3) ? "death" : (mode === "death" && k === (DEATH - LIFE) / 3) ? "mark" : "normal";
        d.material = discMats[sp]; d.scale.setScalar(sp === "normal" ? 1 : 1.7);
      });
      marks.birth.hidden = mode !== "birth"; marks.death.hidden = mode !== "death"; marks.seventeen.hidden = mode !== "death"; marks.corpse.hidden = mode !== "death";
      now = mode === "life" ? 60 : (mode === "death" ? 110 : 100);
      S.dirty = true;
    }
    pills($("d3-loom-modes"), MODES, mode, function (v) { mode = v; build(); });
    if (!S) { text(); return; }
    lanes.forEach(function (lane) {
      var plate = new THREE.Mesh(new THREE.PlaneGeometry(WIN * dx, lane.h), basicMat("--line", 0.35)); plate.position.set(0, lane.y0 + lane.h / 2, -0.2); S.root.add(plate);
      label(S, lane.label, anchor(S, X0 - 0.12, lane.y0 + lane.h / 2, 0), "xs left");
    });
    discMats = { normal: stdMat("--nama-2", { glow: 0.25 }), birth: stdMat("--nib", { glow: 0.4 }), death: stdMat("--ink", { glow: 0.2 }), mark: stdMat("--kamma", { glow: 0.35 }) };
    for (var k = 0; k * 3 < WIN; k++) {
      var d = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 20), discMats.normal); d.rotation.x = Math.PI / 2; d.position.set(X0 + (k * 3 + 1.5) * dx, CY, 0); d.visible = false; S.root.add(d); discs.push(d);
    }
    label(S, "cittas", anchor(S, X0 - 0.12, CY, 0), "xs left");
    marks.birth = label(S, "rebirth-linking", anchor(S, X0 + 1.5 * dx, CY - 0.4, 0), "xs");
    marks.death = label(S, "death", anchor(S, X0 + (DEATH + 1.5) * dx, CY - 0.4, 0), "xs");
    marks.seventeen = label(S, "17 moments before death", anchor(S, X0 + (DEATH - LIFE + 1.5) * dx, CY - 0.4, 0), "xs");
    marks.corpse = label(S, "the corpse: temperature only", anchor(S, X0 + (DEATH + 15) * dx, 2.25, 0.3), "xs");
    nowPlane = new THREE.Mesh(new THREE.BoxGeometry(0.02, 6.1, 0.5), basicMat("--ink", 0.22)); nowPlane.position.set(0, 2.55, 0); S.root.add(nowPlane);
    var nowA = new THREE.Object3D(); nowA.position.set(0, 3.25, 0); nowPlane.add(nowA); label(S, "now", nowA, "xs");
    S.update = function (dt) {
      if (dt) { now += dt * 12; if (now >= WIN) now = mode === "life" ? 60 : 0; }
      nowPlane.position.x = X0 + now * dx;
      units.forEach(function (u) { if (u.s > now) { u.m.visible = false; return; } u.m.visible = true; u.m.material = now < u.s + LIFE ? u.lane.on : u.lane.off; });
      discs.forEach(function (d, k) { d.visible = k * 3 <= now && !(mode === "death" && k * 3 > DEATH); });
    };
    S.beforePrint = function () { mode = "life"; setPressed($("d3-loom-modes"), "life"); build(); now = 62; };
    build();
  })();

  /* ================= 8. D4: helix of dependent origination ================= */
  (function () {
    var L = [["avijjā", "ignorance", "D", 0], ["saṅkhārā", "formations", "K", 0], ["viññāṇa", "consciousness", "R", 1], ["nāmarūpa", "mind and matter", "R", 1], ["saḷāyatana", "six bases", "R", 1], ["phassa", "contact", "R", 1],
      ["vedanā", "feeling", "R", 1], ["taṇhā", "craving", "D", 2], ["upādāna", "clinging", "D", 2], ["bhava", "becoming", "KR", 2], ["jāti", "birth", "R", 3], ["jarāmaraṇa", "decay and death", "R", 3]];
    var RC = { D: "--bad", K: "--nama", R: "--rupa-mark", KR: "--rupa-mark" };
    var GC = ["--muted", "--nama", "--kamma", "--nib"];
    var PC = ["--muted", "--nama", "--nama", "--nib"];
    var mode = "round";
    pills($("d4-helix-btns"), [{ id: "round", label: "Three rounds" }, { id: "group", label: "Four groups" }, { id: "period", label: "Three lives" }], mode, function (v) { mode = v; apply(); });
    var S = make3D("d4-helix", { height: 360, cam: [0, 0.9, 10.6], look: [0, 0.25, 0], fov: 36, spin: 0.14, rotX: 0.12, refAspect: 1.6, phoneRatio: 1.0 });
    if (!S) return;
    var pts = [], nodes = [];
    L.forEach(function (l, i) {
      var a = i * 40 * Math.PI / 180 - Math.PI / 2, y = i * 0.42 - 2.3, p = V(Math.cos(a) * 2.3, y, Math.sin(a) * 2.3); pts.push(p);
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20)); m.position.copy(p); S.root.add(m); nodes.push(m);
      if (l[2] === "KR") { var k2 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), stdMat("--nama", { glow: 0.35 })); k2.position.copy(p).add(V(0, 0.3, 0)); S.root.add(k2); }
      if (i === 0 || i === 7) { var halo = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 40), stdMat("--ink", { glow: 0.2 })); halo.position.copy(p); halo.rotation.x = Math.PI / 2; S.root.add(halo); }
      label(S, (i + 1) + " <i>" + l[0] + "</i> · " + l[1], anchor(S, p.x * 1.22, p.y + 0.12, p.z * 1.22), "sm");
    });
    S.root.add(tube(pts, 0.035, basicMat("--muted", 0.5)));
    [[1, 2], [6, 7], [9, 10]].forEach(function (c, k) {
      var mid = pts[c[0]].clone().add(pts[c[1]]).multiplyScalar(0.5);
      var r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 24), stdMat("--ink", { glow: 0.2 })); r.position.copy(mid); r.lookAt(pts[c[1]]); S.root.add(r);
    });
    var bands = [["past life", -2.55, 0.7, "--muted"], ["this life", -1.6, 3.1, "--nama"], ["next life", 1.75, 0.85, "--nib"]];
    bands.forEach(function (b) {
      var cyl = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.75, b[2], 48, 1, true), basicMat(b[3], 0.07)); cyl.position.y = b[1] + b[2] / 2; cyl.material.side = THREE.DoubleSide; S.root.add(cyl);
      label(S, b[0], anchor(S, -3.2, b[1] + b[2] / 2, 0), "sm left");
    });
    var mats = {};
    function mat(v) { if (!mats[v]) mats[v] = stdMat(v, { glow: 0.35 }); return mats[v]; }
    function apply() {
      nodes.forEach(function (m, i) {
        var l = L[i];
        m.material = mode === "round" ? mat(RC[l[2]]) : mode === "group" ? mat(GC[l[3]]) : mat(PC[l[3]]);
      });
      S.dirty = true;
    }
    apply();
  })();

  /* ================= 9. D4: conditions compass ================= */
  (function () {
    var FAM = [
      { id: "A", c: "--g1", t: "Mind → mind", n: 6, list: "proximity, contiguity, absence, disappearance, repetition, association", d: "Each citta gives way to the next; javanas strengthen their successors; factors arising together are associated." },
      { id: "B", c: "--g2", t: "Mind → mind and matter", n: 5, list: "root, jhāna, path, kamma, result", d: "Roots, jhāna and path factors, volition and resultant mind support both the mind and the matter that arise with them." },
      { id: "C", c: "--g3", t: "Mind → matter", n: 1, list: "postnascence", d: "Later cittas sustain the body that arose before them." },
      { id: "D", c: "--g4", t: "Matter → mind", n: 1, list: "prenascence", d: "Bases and sense objects, already arisen, support the cittas that follow." },
      { id: "E", c: "--g5", t: "Concepts, mind, matter → mind", n: 2, list: "object, decisive support", d: "Anything can be an object; a strong past experience can decisively support what arises now." },
      { id: "F", c: "--g6", t: "Mind and matter → both", n: 9, list: "predominance, conascence, mutuality, support, nutriment, faculty, dissociation, presence, non-disappearance", d: "Things that arise together hold each other up, like the legs of a tripod." }
    ];
    var cur = "all";
    function info() {
      var box = $("d4-comp-info"); if (!box) return;
      if (cur === "all") { box.innerHTML = "<h3>Six families, 24 conditions</h3><p class=\"small\">Arcs between mind (sphere), matter (cube) and concepts (ring). An arc's thickness shows how many conditions its family holds. Choose a family to see them.</p>"; return; }
      var f = FAM.filter(function (x) { return x.id === cur; })[0];
      box.innerHTML = '<h3 style="color:var(' + f.c + ')">' + f.t + " · " + f.n + '</h3><p class="small"><i>' + f.list + '.</i></p><p class="small">' + f.d + "</p>";
    }
    pills($("d4-comp-btns"), [{ id: "all", label: "All" }].concat(FAM.map(function (f) { return { id: f.id, label: f.t.replace(" and ", " & "), c: f.c }; })), cur, function (v) { cur = v; info(); apply(); });
    info();
    var S = make3D("d4-comp", { height: 300, cam: [0, 2.2, 9.6], look: [0, 0.1, 0], fov: 36, sway: 0.45, rotX: 0.1, refAspect: 1.2, phoneRatio: 0.9 });
    if (!S) return;
    var Mi = V(-1.9, 0, 0), Ma = V(1.9, 0, 0), Co = V(0, 0.2, -2.1);
    var mind = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 22), stdMat("--nama", { glow: 0.35 })); mind.position.copy(Mi); S.root.add(mind);
    var matter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), stdMat("--rupa-mark", { glow: 0.3 })); matter.position.copy(Ma); S.root.add(matter);
    var conc = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 10, 40), stdMat("--muted", { glow: 0.2 })); conc.position.copy(Co); S.root.add(conc);
    label(S, "mind", anchor(S, Mi.x, Mi.y - 0.8, Mi.z), "p"); label(S, "matter", anchor(S, Ma.x, Ma.y - 0.8, Ma.z), "p"); label(S, "concepts", anchor(S, Co.x, Co.y - 0.65, Co.z), "p");
    function R(n) { return 0.02 + n * 0.009; }
    var arcs = [];
    function add(fid, pts, closed) { var f = FAM.filter(function (x) { return x.id === fid; })[0]; var m = tube(pts, R(f.n), basicMat(f.c, 0.8), closed); m.userData.f = fid; S.root.add(m); arcs.push(m); return m; }
    var loopA = []; for (var i = 0; i <= 24; i++) { var a = i / 24 * Math.PI * 2; loopA.push(V(Mi.x - 0.2 + Math.cos(a) * 0.9, Mi.y + 0.9 + Math.sin(a) * 0.45, Mi.z + Math.sin(a) * 0.3)); }
    add("A", loopA, true);
    add("B", [V(Mi.x + 0.4, -0.2, 0.3), V(0, -0.5, 1.9), V(Ma.x - 0.4, -0.2, 0.3)]);
    add("C", [V(Mi.x + 0.4, 0.4, 0), V(0, 1.5, 0), V(Ma.x - 0.4, 0.4, 0)]);
    add("D", [V(Ma.x - 0.4, -0.45, 0), V(0, -1.55, 0), V(Mi.x + 0.4, -0.45, 0)]);
    add("E", [V(Co.x - 0.3, Co.y, Co.z + 0.2), V(-1.2, 0.4, -1.1), V(Mi.x + 0.3, 0.1, -0.3)]);
    var loopF = []; for (i = 0; i <= 40; i++) { a = i / 40 * Math.PI * 2; loopF.push(V(Math.cos(a) * 3.1, -0.05 + Math.sin(a * 2) * 0.12, Math.sin(a) * 1.15)); }
    add("F", loopF, true);
    var lab = { A: V(Mi.x - 0.2, 1.62, 0), B: V(0, -0.65, 2.0), C: V(0, 1.15, 0), D: V(0, -1.3, 0), E: V(-1.05, 0.62, -1.25), F: V(3.2, 0.25, 0.4) };
    FAM.forEach(function (f) { f.L = label(S, f.t.split(" ")[0] === "Mind" && f.id !== "F" ? f.n + "" : f.n + "", anchor(S, lab[f.id].x, lab[f.id].y, lab[f.id].z), "badge"); f.L.el.style.background = "var(" + f.c + ")"; });
    function apply() { arcs.forEach(function (m) { m.material.opacity = cur === "all" || cur === m.userData.f ? 0.85 : 0.08; }); FAM.forEach(function (f) { f.L.alpha = cur === "all" || cur === f.id ? 1 : 0.2; }); S.dirty = true; }
    apply();
  })();

  /* ================= 10. D5: planes as a world-mountain ================= */
  (function () {
    var P = [
      ["Niraya", "hell", "w"], ["Tiracchāna", "animals", "w"], ["Peta", "hungry ghosts", "w"], ["Asura", "titans", "w"], ["Manussa", "humans", "h"],
      ["Cātumahārājika", "Four Great Kings · on Sineru's slopes", "s1"], ["Tāvatiṃsa", "Thirty-three · on the summit", "s2"], ["Yāma", "", "d"], ["Tusita", "", "d"], ["Nimmānarati", "", "d"], ["Paranimmitavasavattī", "", "d"],
      ["Brahmapārisajja", "1st jhāna", "b1"], ["Brahmapurohita", "", "b1"], ["Mahābrahmā", "", "b1"],
      ["Parittābha", "2nd jhāna", "b2"], ["Appamāṇābha", "", "b2"], ["Ābhassara", "", "b2"],
      ["Parittasubha", "3rd jhāna", "b3"], ["Appamāṇasubha", "", "b3"], ["Subhakiṇha", "", "b3"],
      ["Vehapphala", "4th jhāna", "b4"], ["Asaññasatta", "matter only", "b4n"], ["Aviha", "pure abode", "b4"], ["Atappa", "", "b4"], ["Sudassa", "", "b4"], ["Sudassī", "", "b4"], ["Akaniṭṭha", "highest pure abode", "b4"],
      ["Ākāsānañcāyatana", "infinite space", "a"], ["Viññāṇañcāyatana", "infinite consciousness", "a"], ["Ākiñcaññāyatana", "nothingness", "a"], ["Nevasaññānāsaññāyatana", "", "a"]
    ];
    var S = make3D("d5-view", { height: 560, cam: [0, 5.6, 19.5], look: [0, 4.6, 0], fov: 36, spin: 0.12, rotX: 0.06, refAspect: 1.15, phoneRatio: 1.35 });
    if (!S) return;
    var y = -0.4, prev = null, GAP = { w: 0, h: 0.35, s1: 0.2, s2: 0.2, d: 0.25, b1: 0.35, b2: 0.3, b3: 0.3, b4: 0.3, b4n: 0.3, a: 0.4 };
    var yS = {};
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
        var ringK = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 10, 60), mat); ringK.rotation.x = Math.PI / 2; ringK.position.y = y; S.root.add(ringK);
      } else {
        var disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.07, 64), mat); disc.position.y = y; S.root.add(disc);
      }
      yS[p[0]] = y;
      var side = i % 2 ? 1 : -1;
      label(S, "<i>" + p[0] + "</i>" + (p[1] ? " · " + p[1] : ""), anchor(S, side * 2.55, y, 0), "xs " + (side > 0 ? "right" : "left"));
    });
    var hY = yS.Manussa, tY = yS["Tāvatiṃsa"];
    var cone = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.95, tY - hY, 40, 1), stdMat("--rupa", { glow: 0.12, opacity: 0.9 })); cone.position.y = (hY + tY) / 2; S.root.add(cone);
    label(S, "Mount Sineru", anchor(S, 0, (hY + tY) / 2, 1.05), "xs");
    var axis = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, y + 1, 8), basicMat("--line", 0.6)); axis.position.y = y / 2; S.root.add(axis);
    var brk = [["woeful", 0, 3], ["sense heavens", 5, 10], ["fine-material", 11, 26], ["immaterial", 27, 30]];
    brk.forEach(function (b) { label(S, b[0].toUpperCase(), anchor(S, 0, (P[b[1]].y + P[b[2]].y) / 2, -2.6), "cap3"); });
  })();

  /* ================= 11. D6: requisites skyline ================= */
  (function () {
    var G = [["Foundations of mindfulness", "--th1"], ["Right efforts", "--th4"], ["Bases of success", "--th10"], ["Faculties", "--th3"], ["Powers", "--th2"], ["Enlightenment factors", "--th8"], ["Path factors", "--th9"]];
    var ST = [
      ["viriya", "energy", [0, 4, 1, 1, 1, 1, 1]], ["sati", "mindfulness", [4, 0, 0, 1, 1, 1, 1]], ["paññā", "wisdom", [0, 0, 1, 1, 1, 1, 1]], ["samādhi", "concentration", [0, 0, 0, 1, 1, 1, 1]], ["saddhā", "faith", [0, 0, 0, 1, 1, 0, 0]],
      ["chanda", "desire", [0, 0, 1, 0, 0, 0, 0]], ["citta", "consciousness", [0, 0, 1, 0, 0, 0, 0]], ["pīti", "zest", [0, 0, 0, 0, 0, 1, 0]], ["passaddhi", "tranquillity", [0, 0, 0, 0, 0, 1, 0]], ["upekkhā", "equanimity", [0, 0, 0, 0, 0, 1, 0]],
      ["vitakka", "right thought", [0, 0, 0, 0, 0, 0, 1]], ["sammā-vācā", "right speech", [0, 0, 0, 0, 0, 0, 1]], ["sammā-kammanta", "right action", [0, 0, 0, 0, 0, 0, 1]], ["sammā-ājīva", "right livelihood", [0, 0, 0, 0, 0, 0, 1]]
    ];
    if ($("d6-sky-legend")) $("d6-sky-legend").innerHTML = G.map(function (g) { return '<span><i style="background:var(' + g[1] + ')"></i>' + g[0] + "</span>"; }).join("");
    var S = make3D("d6-sky", { height: 300, cam: [0, 3.0, 8.4], look: [0, 1.45, 0], fov: 34, sway: 0.3, rotX: 0.04, refAspect: 2.0, phoneRatio: 0.85 });
    if (!S) return;
    var step = 0.56, x0 = -((ST.length - 1) * step) / 2, cube = new THREE.BoxGeometry(0.44, 0.34, 0.44), mats = G.map(function (g) { return stdMat(g[1], { glow: 0.28 }); });
    ST.forEach(function (s, i) {
      var x = x0 + i * step, h = 0;
      s[2].forEach(function (n, gi) { for (var k = 0; k < n; k++) { var m = new THREE.Mesh(cube, mats[gi]); m.position.set(x, 0.17 + h * 0.37, 0); S.root.add(m); h++; } });
      label(S, h + "", anchor(S, x, h * 0.37 + 0.25, 0), "xs");
      label(S, "<i>" + s[0] + "</i>", anchor(S, x, i % 2 ? -0.62 : -0.3, 0.35), "xs");
    });
    var base = new THREE.Mesh(new THREE.BoxGeometry(ST.length * step + 0.3, 0.04, 0.9), basicMat("--line", 0.5)); base.position.y = -0.03; S.root.add(base);
  })();

  /* ================= 12. D6: fetters ================= */
  (function () {
    var F = [["personality view", 0], ["doubt", 0], ["rites and rules", 0], ["sensual desire", 1], ["ill will", 1], ["lust for fine-material being", 3], ["lust for immaterial being", 3], ["conceit", 3], ["restlessness", 3], ["ignorance", 3]];
    var PC = ["--nib", "--th8", "--th8", "--nama"];
    var STAGES = [{ id: "0", label: "Ordinary person" }, { id: "1", label: "Stream-enterer" }, { id: "2", label: "Once-returner" }, { id: "3", label: "Non-returner" }, { id: "4", label: "Arahant" }];
    var CAP = { "0": "All ten fetters bind.", "1": "Personality view, doubt and clinging to rites and rules are gone for good.", "2": "Sensual desire and ill will remain, but weakened.", "3": "Sensual desire and ill will are gone; five subtle fetters remain.", "4": "No fetter remains." };
    var cur = "0";
    var S = make3D("d6-fet", { height: 300, cam: [0, 1.6, 8.6], look: [0, 1.25, 0], fov: 34, spin: 0.2, rotX: 0.08, refAspect: 1.1, phoneRatio: 0.95 });
    var rings = [];
    function apply() {
      var st = +cur;
      rings.forEach(function (r, i) {
        var f = F[i], gone = (f[1] === 0 && st >= 1) || (f[1] === 1 && st >= 3) || (f[1] === 3 && st >= 4), weak = f[1] === 1 && st === 2;
        r.m.visible = !gone; r.L.hidden = gone; r.m.scale.setScalar(weak ? 0.75 : 1); r.m.material.opacity = weak ? 0.35 : 0.95;
      });
      if ($("d6-fet-cap")) $("d6-fet-cap").innerHTML = "<b>" + STAGES[st].label + ".</b> " + CAP[cur];
      if (S) S.dirty = true;
    }
    pills($("d6-fet-btns"), STAGES, cur, function (v) { cur = v; apply(); });
    if (!S) { apply(); return; }
    var col0 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 32), stdMat("--nib", { glow: 0.3, opacity: 0.55 })); col0.position.y = 1.4; S.root.add(col0);
    F.forEach(function (f, i) {
      var y = 0.05 + i * 0.3, m = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.07, 12, 48), stdMat(PC[f[1]], { glow: 0.3, opacity: 0.95 })); m.rotation.x = Math.PI / 2; m.position.y = y; S.root.add(m);
      var L = label(S, f[0], anchor(S, 0.95, y, 0), "xs right");
      rings.push({ m: m, L: L });
    });
    label(S, "Nibbāna", anchor(S, 0, 3.4, 0), "p");
    apply();
  })();

  /* ================= 13. D7: the weave ================= */
  (function () {
    var PLv = [1, 1, 2, 2, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7];
    var PS = ["Library", "Two truths", "The 89", "The 52", "Matter", "Similes", "Seeing", "Conditions", "The wheel", "Kamma", "Planes", "Calm", "Insight", "Every lens", "Other maps"];
    var TH = [
      ["citta", "--th1", [2, 3, 4, 6, 7, 8, 9, 11, 14, 15]], ["feeling", "--th2", [2, 3, 4, 6, 9, 12, 14]], ["contact", "--th3", [2, 4, 6, 8, 9, 14]], ["kamma", "--th4", [4, 5, 6, 7, 8, 9, 10, 14]],
      ["matter", "--th5", [2, 5, 6, 7, 8, 11, 14, 15]], ["bhavaṅga", "--th6", [7, 10, 14, 15]], ["roots", "--th7", [4, 8, 9, 13, 14]], ["jhāna", "--th8", [3, 4, 8, 10, 11, 12, 13]],
      ["Nibbāna", "--th9", [2, 13, 15]], ["wisdom", "--th10", [4, 6, 13, 14]], ["time", "--th11", [5, 7, 10, 11, 15]]
    ];
    var cur = "all";
    pills($("d7-btns"), [{ id: "all", label: "All threads" }].concat(TH.map(function (t) { return { id: t[0], label: t[0], c: t[1] }; })), cur, function (v) { cur = v; apply(); });
    var S = make3D("d7-view", { height: 470, cam: [0, 2.6, 13.6], look: [0, 0.2, 0], fov: 36, spin: 0.12, rotX: 0.1, refAspect: 1.4, phoneRatio: 1.1 });
    if (!S) return;
    var pos = [];
    for (var p = 1; p <= 15; p++) {
      var a = (p - 1) * 26 * Math.PI / 180, y = (PLv[p - 1] - 1) * 0.85 - 2.6 + ((p - 1) % 2) * 0.12, v3 = V(Math.cos(a) * 2.8, y, Math.sin(a) * 2.8); pos[p] = v3;
      var card = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.06), stdMat("--lv" + PLv[p - 1], { glow: 0.3 })); card.position.copy(v3); card.lookAt(V(0, y, 0)); S.root.add(card);
      label(S, "<b>" + p + "</b> " + PS[p - 1], anchor(S, v3.x * 1.18, v3.y + 0.32, v3.z * 1.18), "xs");
    }
    var tubes = [];
    TH.forEach(function (t, k) {
      var off = (k - 5) * 0.045;
      var pts = t[2].map(function (p) { var q = pos[p].clone(); var n = V(q.x, 0, q.z).normalize(); return q.add(n.multiplyScalar(off)).add(V(0, off, 0)); });
      var m = tube(pts, 0.022, basicMat(t[1], 0.85)); m.userData.t = t[0]; S.root.add(m); tubes.push(m);
    });
    function apply() { tubes.forEach(function (m) { m.material.opacity = cur === "all" || cur === m.userData.t ? 0.9 : 0.06; }); S.dirty = true; }
    apply();
  })();

  if (scenes.length) requestAnimationFrame(loop);
})();
