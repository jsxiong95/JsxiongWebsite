// os.js
// window manager + taskbar + start menu + clock. driven by window.APPS
// (config.js) and window.renderApp (renderers.js), doesn't hardcode any app.
//
// every launch is its own instance: a unique id, its own window and taskbar
// tab. apps are single-window by default (clicking the icon refocuses).

(function () {
  "use strict";

  const APPS = window.APPS || [];
  const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));

  // DOM anchors from index.html
  const desktop = document.getElementById("desktop");
  const iconLayer = document.getElementById("icon-layer");
  const windowLayer = document.getElementById("window-layer");
  const processBar = document.getElementById("process-bar");
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const clockEl = document.getElementById("clock");

  // desktop (draggable windows) vs mobile (full-screen apps + switcher).
  // shared with the css through body.mobile-mode so layout and behaviour
  // stay in sync.
  const mobileMQ = window.matchMedia(
    "(max-width: 820px), (pointer: coarse) and (max-width: 1024px)"
  );
  function isMobile() { return mobileMQ.matches; }
  function applyShellMode() {
    document.body.classList.toggle("mobile-mode", mobileMQ.matches);
  }

  // open instances: instanceId -> { instanceId, app, win, tab, minimized }
  const open = new Map();
  let zTop = 10;
  let instanceSeq = 0;

  // helpers
  function el(tag, className, html) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // icon image, falls back to a css placeholder if the png is missing
  function iconImg(app, extraClass) {
    const img = el("img", "app-icon-img" + (extraClass ? " " + extraClass : ""));
    img.alt = "";
    img.src = app.icon || "";
    img.onerror = () => {
      const ph = el("span", "app-icon-fallback" + (extraClass ? " " + extraClass : ""));
      ph.textContent = (app.title || "?").charAt(0).toUpperCase();
      ph.title = "Drop a PNG at " + app.icon;
      img.replaceWith(ph);
    };
    return img;
  }

  function firstInstanceOf(appId) {
    for (const [iid, e] of open) if (e.app.id === appId) return iid;
    return null;
  }
  function countInstancesOf(appId) {
    let n = 0;
    for (const e of open.values()) if (e.app.id === appId) n++;
    return n;
  }

  // desktop icons
  function buildIcons() {
    iconLayer.innerHTML = "";
    APPS.forEach((app) => {
      const icon = el("button", "desktop-icon");
      icon.type = "button";
      icon.setAttribute("aria-label", "Open " + app.title);
      icon.appendChild(iconImg(app));
      icon.appendChild(el("span", "desktop-icon__label", app.title));
      icon.addEventListener("click", () => launch(app.id));
      iconLayer.appendChild(icon);
    });
  }

  // launching / windows

  // focus an existing window or spawn a new one
  function launch(appId) {
    const app = byId[appId];
    if (!app) return;

    // link apps just open a url
    if (app.type === "link" && app.data && app.data.url) {
      window.open(app.data.url, "_blank", "noopener");
      return;
    }

    // single-window apps: refocus if already open
    if (!app.multi) {
      const existing = firstInstanceOf(appId);
      if (existing) {
        restoreWindow(existing);
        focusWindow(existing);
        return;
      }
    }

    spawnWindow(app);
  }

  function spawnWindow(app) {
    const instanceId = app.id + "#" + ++instanceSeq;

    // window shell
    const win = el("div", "window");
    win.dataset.instance = instanceId;
    win.style.width = (app.width || 640) + "px";
    win.style.height = (app.height || 480) + "px";

    // desktop: open at a random spot that keeps the whole window on screen.
    // mobile opens full-screen via css, so this only affects desktop.
    if (!isMobile()) {
      const margin = 16;
      const barH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--bar-h")
      ) || 56;
      const w = app.width || 640, h = app.height || 480;
      const maxLeft = Math.max(margin, window.innerWidth - w - margin);
      const maxTop = Math.max(margin, window.innerHeight - barH - h - margin);
      win.style.left = Math.round(margin + Math.random() * (maxLeft - margin)) + "px";
      win.style.top = Math.round(margin + Math.random() * (maxTop - margin)) + "px";
    } else {
      win.style.left = "0px";
      win.style.top = "0px";
    }

    // title bar
    const bar = el("div", "window__bar");
    const titleWrap = el("div", "window__title");
    titleWrap.appendChild(iconImg(app, "window__title-icon"));
    // number repeat instances: "my game (2)"
    const n = countInstancesOf(app.id);
    const label = n > 0 ? app.title + " (" + (n + 1) + ")" : app.title;
    titleWrap.appendChild(el("span", null, label));
    bar.appendChild(titleWrap);

    const controls = el("div", "window__controls");
    const minBtn = el("button", "window__btn window__btn--min", "_");
    const closeBtn = el("button", "window__btn window__btn--close", "\u2715");
    minBtn.type = closeBtn.type = "button";
    minBtn.setAttribute("aria-label", "Minimize " + app.title);
    closeBtn.setAttribute("aria-label", "Close " + app.title);
    controls.append(minBtn, closeBtn);
    bar.appendChild(controls);

    // body (filled by renderers). game/iframe render edge-to-edge.
    const flush = app.type === "game" || app.type === "iframe" || app.flush;
    const body = el("div", "window__body" + (flush ? " window__body--flush" : ""));
    body.appendChild(window.renderApp(app));

    win.append(bar, body);
    windowLayer.appendChild(win);

    // taskbar tab
    const tab = el("button", "process-tab");
    tab.type = "button";
    tab.dataset.instance = instanceId;
    tab.appendChild(iconImg(app, "process-tab__icon"));
    tab.appendChild(el("span", "process-tab__label", label));
    tab.appendChild(el("span", "process-tab__hint", "_"));
    processBar.appendChild(tab);

    open.set(instanceId, { instanceId, app, win, tab, minimized: false });

    // wiring
    minBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeWindow(instanceId);
    });
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow(instanceId);
    });
    win.addEventListener("mousedown", () => focusWindow(instanceId));
    tab.addEventListener("click", () => toggleFromTab(instanceId));
    makeDraggable(win, bar);

    focusWindow(instanceId);
    layoutTabs();
    return instanceId;
  }

  function focusWindow(iid) {
    const entry = open.get(iid);
    if (!entry) return;
    zTop += 1;
    entry.win.style.zIndex = zTop;
    open.forEach((e, key) => {
      const active = key === iid && !e.minimized;
      e.win.classList.toggle("window--active", active);
      e.tab.classList.toggle("process-tab--active", active);
    });
  }

  function minimizeWindow(iid) {
    const entry = open.get(iid);
    if (!entry) return;
    entry.minimized = true;
    entry.win.classList.add("window--minimized");
    entry.win.classList.remove("window--active");
    entry.tab.classList.remove("process-tab--active");
  }

  function restoreWindow(iid) {
    const entry = open.get(iid);
    if (!entry) return;
    entry.minimized = false;
    entry.win.classList.remove("window--minimized");
  }

  // tab click: minimize if focused, else restore + focus
  function toggleFromTab(iid) {
    const entry = open.get(iid);
    if (!entry) return;
    const isTop = !entry.minimized && parseInt(entry.win.style.zIndex, 10) === zTop;
    if (isTop) {
      minimizeWindow(iid);
    } else {
      restoreWindow(iid);
      focusWindow(iid);
    }
  }

  function closeWindow(iid) {
    const entry = open.get(iid);
    if (!entry) return;
    entry.win.remove();
    entry.tab.remove();
    open.delete(iid);
    layoutTabs();
    // focus the next-highest window, if any
    let topId = null;
    let topZ = -1;
    open.forEach((e, key) => {
      const z = parseInt(e.win.style.zIndex, 10) || 0;
      if (!e.minimized && z > topZ) {
        topZ = z;
        topId = key;
      }
    });
    if (topId) focusWindow(topId);
  }

  // tabs share the bar evenly (css flex:1); expose the count for tuning
  function layoutTabs() {
    processBar.style.setProperty("--tab-count", open.size);
  }

  // dragging
  function makeDraggable(win, handle) {
    let startX = 0, startY = 0, originLeft = 0, originTop = 0, dragging = false;

    function pointerDown(e) {
      if (isMobile()) return;            // mobile app views aren't dragged
      if (e.target.closest(".window__controls")) return; // not from buttons
      dragging = true;
      const pt = e.touches ? e.touches[0] : e;
      startX = pt.clientX;
      startY = pt.clientY;
      originLeft = win.offsetLeft;
      originTop = win.offsetTop;
      document.body.classList.add("is-dragging");
      // stop the iframe swallowing the mouse mid-drag
      win.classList.add("window--dragging");
      window.addEventListener("mousemove", pointerMove);
      window.addEventListener("mouseup", pointerUp);
      window.addEventListener("touchmove", pointerMove, { passive: false });
      window.addEventListener("touchend", pointerUp);
    }
    function pointerMove(e) {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      const pt = e.touches ? e.touches[0] : e;
      let nextLeft = originLeft + (pt.clientX - startX);
      let nextTop = originTop + (pt.clientY - startY);
      const maxLeft = desktop.clientWidth - 48;
      const maxTop = desktop.clientHeight - 48;
      nextLeft = Math.min(Math.max(nextLeft, -win.offsetWidth + 96), maxLeft);
      nextTop = Math.min(Math.max(nextTop, 0), maxTop);
      win.style.left = nextLeft + "px";
      win.style.top = nextTop + "px";
    }
    function pointerUp() {
      dragging = false;
      document.body.classList.remove("is-dragging");
      win.classList.remove("window--dragging");
      window.removeEventListener("mousemove", pointerMove);
      window.removeEventListener("mouseup", pointerUp);
      window.removeEventListener("touchmove", pointerMove);
      window.removeEventListener("touchend", pointerUp);
    }
    handle.addEventListener("mousedown", pointerDown);
    handle.addEventListener("touchstart", pointerDown, { passive: true });
  }

  // storage, sound, face, themes
  const SYSTEM = window.SYSTEM || {};
  const THEMES = SYSTEM.themes || [];

  function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  // storage that no-ops where it's blocked (sandboxes)
  function storeGet(k) { try { return localStorage.getItem("pos." + k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem("pos." + k, v); } catch (e) {} }

  // retro sound via web audio, no asset files
  let audioCtx = null;
  let muted = storeGet("muted") === "1";
  function ac() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return audioCtx; }
  function tone(freq, dur, type, vol, delay) {
    if (muted) return; const c = ac(); if (!c) return;
    try {
      if (c.state === "suspended") c.resume();
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (delay || 0);
      o.type = type || "square"; o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  function sweep(from, to, dur, type, vol) {
    if (muted) return; const c = ac(); if (!c) return;
    try {
      if (c.state === "suspended") c.resume();
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = type || "sawtooth"; o.connect(g); g.connect(c.destination);
      o.frequency.setValueAtTime(from, t);
      o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(vol || 0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  const sfxOpen = () => { tone(620, 0.05); tone(880, 0.06, "square", 0.035, 0.05); };
  const sfxLaunch = () => { tone(523, 0.05); tone(784, 0.06, "square", 0.035, 0.05); };
  const sfxDown = () => sweep(680, 70, 0.6, "sawtooth", 0.05);
  const sfxBoot = () => [392, 523, 659, 784].forEach((f, i) => tone(f, 0.12, "square", 0.04, i * 0.12));

  // start-button face
  let menuOpen = false, faceHover = false;
  function restFace() { return menuOpen ? "grin" : (faceHover ? "wink" : ""); }
  function applyFace() { const f = restFace(); if (f) startButton.dataset.face = f; else delete startButton.dataset.face; }
  function flashFace(f, ms) { startButton.dataset.face = f; setTimeout(applyFace, ms || 140); }
  function initFace() {
    startButton.addEventListener("mouseenter", () => { faceHover = true; applyFace(); });
    startButton.addEventListener("mouseleave", () => { faceHover = false; applyFace(); });
    startButton.addEventListener("mousedown", () => flashFace("oh", 160));
    setInterval(() => { if (restFace() === "") flashFace("blink", 150); }, 3800);
  }

  // colour themes
  let currentTheme = (THEMES[0] && THEMES[0].id) || null;
  function applyTheme(id) {
    const t = THEMES.find((x) => x.id === id) || THEMES[0];
    if (!t) return;
    const root = document.documentElement;
    Object.keys(t.vars || {}).forEach((k) => root.style.setProperty(k, t.vars[k]));
    currentTheme = t.id; storeSet("theme", t.id); markThemeSelection();
  }
  function markThemeSelection() {
    document.querySelectorAll(".theme-chip").forEach((c) =>
      c.classList.toggle("theme-chip--on", c.dataset.theme === currentTheme));
  }

  // start menu
  function categoryOf(app) {
    if (app.category) return app.category;
    if (app.type === "link") return "Links";
    if (app.type === "game" || app.type === "iframe") return "Games";
    return "Apps";
  }
  function filterMenu(scroll, q) {
    q = (q || "").trim().toLowerCase();
    scroll.querySelectorAll(".start-menu__item, .start-menu__link").forEach((it) => {
      it.hidden = !(!q || (it.dataset.search || "").includes(q));
    });
    scroll.querySelectorAll(".start-menu__group").forEach((g) => {
      g.hidden = !g.querySelector(".start-menu__item:not([hidden]), .start-menu__link:not([hidden])");
    });
  }

  function buildStartMenu() {
    startMenu.innerHTML = "";
    const u = SYSTEM.user || {};

    // identity banner
    const banner = el("div", "start-menu__banner");
    const ava = el("div", "start-menu__avatar");
    if (u.avatar) {
      const im = el("img"); im.alt = ""; im.src = u.avatar;
      im.onerror = () => { ava.textContent = (u.name || "U").charAt(0).toUpperCase(); };
      ava.appendChild(im);
    } else {
      ava.textContent = (u.name || "U").charAt(0).toUpperCase();
    }
    const who = el("div", "start-menu__who");
    who.appendChild(el("div", "start-menu__name", esc(u.name || "User")));
    if (u.status) who.appendChild(el("div", "start-menu__status", esc(u.status)));
    banner.append(ava, who);
    startMenu.appendChild(banner);

    // search
    const search = el("div", "start-menu__search");
    const input = document.createElement("input");
    input.type = "text"; input.className = "start-menu__search-input";
    input.placeholder = "Search\u2026"; input.setAttribute("aria-label", "Search apps");
    search.appendChild(input);
    startMenu.appendChild(search);

    // grouped app list
    const scroll = el("div", "start-menu__scroll");
    startMenu.appendChild(scroll);

    const groups = {};
    APPS.forEach((a) => { const c = categoryOf(a); (groups[c] = groups[c] || []).push(a); });
    const order = ["Apps", "Games", "Links"];
    const rank = (c) => (order.indexOf(c) < 0 ? 99 : order.indexOf(c));
    Object.keys(groups).sort((a, b) => rank(a) - rank(b)).forEach((cat) => {
      const g = el("div", "start-menu__group");
      g.appendChild(el("div", "start-menu__group-title", esc(cat)));
      groups[cat].forEach((app) => {
        const item = el("button", "start-menu__item");
        item.type = "button";
        item.dataset.search = (app.title + " " + app.id).toLowerCase();
        item.appendChild(iconImg(app, "start-menu__icon"));
        item.appendChild(el("span", null, app.title));
        item.addEventListener("click", () => { launch(app.id); setStartOpen(false); });
        g.appendChild(item);
      });
      scroll.appendChild(g);
    });

    // pinned links
    const links = SYSTEM.links || [];
    if (links.length) {
      const g = el("div", "start-menu__group");
      g.appendChild(el("div", "start-menu__group-title", "Links"));
      const row = el("div", "start-menu__links");
      links.forEach((l) => {
        const a = el("a", "start-menu__link", esc(l.label));
        a.href = l.url; a.target = "_blank"; a.rel = "noopener";
        a.dataset.search = (l.label || "").toLowerCase();
        a.addEventListener("click", () => setStartOpen(false));
        row.appendChild(a);
      });
      g.appendChild(row);
      scroll.appendChild(g);
    }

    // appearance / run / restart / shut down
    const sys = el("div", "start-menu__system");

    const appearance = el("button", "start-menu__sys-item", "\uD83C\uDFA8 Appearance");
    appearance.type = "button";
    const themeBox = el("div", "start-menu__themes");
    THEMES.forEach((t) => {
      const chip = el("button", "theme-chip");
      chip.type = "button"; chip.dataset.theme = t.id;
      const sw = el("span", "theme-chip__sw");
      sw.style.background = (t.vars && t.vars["--desktop"]) || "#000";
      chip.append(sw, el("span", null, esc(t.name)));
      chip.addEventListener("click", () => { applyTheme(t.id); sfxOpen(); });
      themeBox.appendChild(chip);
    });
    appearance.addEventListener("click", () => themeBox.classList.toggle("start-menu__themes--open"));

    const runItem = el("button", "start-menu__sys-item", "\u25B6 Run\u2026");
    runItem.type = "button";
    runItem.addEventListener("click", () => { setStartOpen(false); openRun(); });

    const restart = el("button", "start-menu__sys-item", "\u21BB Restart");
    restart.type = "button";
    restart.addEventListener("click", () => { setStartOpen(false); powerOff({ restart: true }); });

    const shut = el("button", "start-menu__sys-item start-menu__sys-item--danger", "\u23FB Shut Down");
    shut.type = "button";
    shut.addEventListener("click", () => { setStartOpen(false); powerOff({ restart: false }); });

    sys.append(appearance, themeBox, runItem, restart, shut);
    startMenu.appendChild(sys);

    input.addEventListener("input", () => filterMenu(scroll, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = scroll.querySelector(".start-menu__item:not([hidden]), .start-menu__link:not([hidden])");
        if (first) first.click();
      }
    });
    startMenu._search = input;
    markThemeSelection();
  }

  function setStartOpen(state) {
    startMenu.classList.toggle("start-menu--open", state);
    startButton.classList.toggle("start-button--active", state);
    startButton.setAttribute("aria-expanded", state ? "true" : "false");
    menuOpen = state; applyFace();
    if (state) {
      sfxOpen();
      const sc = startMenu.querySelector(".start-menu__scroll");
      const tb = startMenu.querySelector(".start-menu__themes");
      if (tb) tb.classList.remove("start-menu__themes--open");
      if (startMenu._search) {
        startMenu._search.value = "";
        if (sc) filterMenu(sc, "");
        if (!isMobile()) setTimeout(() => startMenu._search.focus(), 30);
      }
    }
  }

  startButton.addEventListener("click", (e) => {
    e.stopPropagation();
    setStartOpen(!startMenu.classList.contains("start-menu--open"));
  });
  document.addEventListener("click", (e) => {
    if (!startMenu.contains(e.target) && e.target !== startButton) setStartOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setStartOpen(false);
  });

  // run dialog
  let runOverlay = null;
  function openRun() {
    if (!runOverlay) runOverlay = buildRun();
    runOverlay.classList.add("run--open");
    const inp = runOverlay.querySelector(".run__input");
    const out = runOverlay.querySelector(".run__out");
    out.textContent = ""; inp.value = ""; setTimeout(() => inp.focus(), 30);
  }
  function closeRun() { if (runOverlay) runOverlay.classList.remove("run--open"); }
  function buildRun() {
    const ov = el("div", "run");
    const box = el("div", "run__box");
    const bar = el("div", "run__bar");
    bar.appendChild(el("span", "run__title", "Run"));
    const x = el("button", "window__btn window__btn--close", "\u2715");
    x.type = "button"; x.addEventListener("click", closeRun);
    bar.appendChild(x);
    const body = el("div", "run__body");
    body.appendChild(el("p", "run__hint", "Type an app name and press Enter. Try \u201Chelp\u201D."));
    const inp = document.createElement("input");
    inp.className = "run__input"; inp.type = "text"; inp.placeholder = "> ";
    inp.setAttribute("aria-label", "Run command");
    const out = el("pre", "run__out");
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { runCommand(inp.value, out); inp.value = ""; }
      else if (e.key === "Escape") closeRun();
    });
    body.append(inp, out);
    box.append(bar, body);
    ov.appendChild(box);
    ov.addEventListener("click", (e) => { if (e.target === ov) closeRun(); });
    document.body.appendChild(ov);
    return ov;
  }
  function runCommand(raw, out) {
    const cmd = (raw || "").trim(); if (!cmd) return;
    const low = cmd.toLowerCase();
    if (low === "clear" || low === "cls") { out.textContent = ""; return; }
    if (low === "shutdown" || low === "poweroff") { closeRun(); powerOff({ restart: false }); return; }
    if (low === "restart" || low === "reboot") { closeRun(); powerOff({ restart: true }); return; }
    if (low.indexOf("theme ") === 0) {
      const q = low.slice(6).trim();
      const t = THEMES.find((x) => x.id === q || (x.name || "").toLowerCase() === q);
      if (t) { applyTheme(t.id); sfxLaunch(); out.textContent = "theme \u2192 " + t.name; }
      else out.textContent = "unknown theme: " + q + "  (" + THEMES.map((x) => x.id).join(", ") + ")";
      return;
    }
    const app = APPS.find((a) => a.id.toLowerCase() === low || (a.title || "").toLowerCase() === low);
    if (app) { launch(app.id); sfxLaunch(); out.textContent = "launching " + app.title + "\u2026"; closeRun(); return; }
    const jokes = SYSTEM.run || {};
    if (Object.prototype.hasOwnProperty.call(jokes, low)) { out.textContent = jokes[low]; return; }
    out.textContent = "Unknown command: " + cmd + "   (try \u201Chelp\u201D)";
  }

  // boot splash + power off/on
  let bootOverlay = null, powerOverlay = null;
  function ensureBoot() {
    if (!bootOverlay) {
      bootOverlay = el("div", "boot");
      const b = SYSTEM.boot || {};
      bootOverlay.appendChild(el("div", "boot__logo", esc(b.title || "PORTFOLIO OS")));
      bootOverlay.appendChild(el("div", "boot__sub", esc(b.subtitle || "")));
      const bar = el("div", "boot__bar"); bar.appendChild(el("div", "boot__fill"));
      bootOverlay.appendChild(bar);
      document.body.appendChild(bootOverlay);
    }
    return bootOverlay;
  }
  function runBoot(done) {
    const b = ensureBoot();
    b.classList.remove("boot--hide");
    b.classList.add("boot--show");
    const fill = b.querySelector(".boot__fill");
    fill.style.transition = "none"; fill.style.width = "0%";
    void b.offsetWidth;                       // reflow so the bar animates from 0
    fill.style.transition = "width 1.3s steps(22)";
    fill.style.width = "100%";
    sfxBoot();
    setTimeout(() => {
      b.classList.add("boot--hide");
      setTimeout(() => { b.classList.remove("boot--show", "boot--hide"); if (done) done(); }, 420);
    }, 1500);
  }
  function ensurePower() {
    if (!powerOverlay) {
      powerOverlay = el("div", "power");
      powerOverlay.appendChild(el("div", "power__tube"));
      powerOverlay.appendChild(el("div", "power__hint", "click to power on"));
      powerOverlay.addEventListener("click", () => {
        if (powerOverlay.classList.contains("power--ready")) {
          powerOverlay.classList.remove("power--ready");
          runBoot(() => powerOverlay.classList.remove("power--show"));
        }
      });
      document.body.appendChild(powerOverlay);
    }
    return powerOverlay;
  }
  function powerOff(opts) {
    const restart = !!(opts && opts.restart);
    Array.from(open.keys()).forEach(closeWindow);   // close everything first
    setStartOpen(false); closeRun();
    sfxDown();
    const p = ensurePower();
    p.classList.add("power--show"); p.classList.remove("power--ready");
    const tube = p.querySelector(".power__tube");
    tube.style.animation = "none"; void tube.offsetWidth; tube.style.animation = "";
    p.classList.add("power--collapsing");
    setTimeout(() => {
      p.classList.remove("power--collapsing");
      if (restart) runBoot(() => p.classList.remove("power--show"));
      else p.classList.add("power--ready");
    }, 720);
  }

  // clock
  function tickClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clockEl.textContent = h + ":" + m + " " + ampm;
  }

  // startup
  const speaker = document.querySelector(".tray__speaker");
  function renderMute() { if (speaker) speaker.textContent = muted ? "\uD83D\uDD07" : "\uD83D\uDD08"; }  if (speaker) {
    speaker.style.cursor = "pointer";
    speaker.title = "Mute / unmute";
    speaker.addEventListener("click", () => {
      muted = !muted; storeSet("muted", muted ? "1" : "0"); renderMute(); if (!muted) sfxOpen();
    });
  }

  applyTheme(storeGet("theme") || currentTheme);
  renderMute();
  buildIcons();
  buildStartMenu();
  initFace();
  applyShellMode();
  if (mobileMQ.addEventListener) mobileMQ.addEventListener("change", applyShellMode);
  else if (mobileMQ.addListener) mobileMQ.addListener(applyShellMode); // old safari
  layoutTabs();
  tickClock();
  setInterval(tickClock, 1000);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRun(); });
  runBoot();   // power-on splash on first load
})();
