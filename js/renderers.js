// renderers.js
// builds the DOM that goes inside each window body. one function per app
// type from config.js.

// helpers

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

// real <img> when a path is given (falls back to a placeholder if the file
// is missing), otherwise a placeholder box.
function mediaImage(src, label) {
  if (src && src.trim()) {
    const img = el("img", "pix-img");
    img.alt = label || "artwork";
    img.src = src;
    img.loading = "lazy";
    img.onerror = () => img.replaceWith(placeholder(label || "image"));
    return img;
  }
  return placeholder(label || "image");
}

// real <video controls> when a path is given, else a placeholder styled like
// a play button.
function mediaVideo(src, label) {
  if (src && src.trim()) {
    const v = el("video", "pix-video");
    v.controls = true;
    v.preload = "metadata";
    v.src = src;
    return v;
  }
  const box = placeholder(label || "gameplay video");
  box.classList.add("placeholder--video");
  box.prepend(el("span", "placeholder__play", "▶"));
  return box;
}

function placeholder(label) {
  const box = el("div", "placeholder");
  box.appendChild(el("span", "placeholder__label", esc(label)));
  return box;
}

// renderers


const RENDERERS = {

  // carousel (games)
  carousel(app) {
    const items = (app.data && app.data.items) || [];
    const root = el("div", "carousel");

    if (!items.length) {
      root.appendChild(emptyState("No projects yet", "Add items in config.js"));
      return root;
    }

    const stage = el("div", "carousel__stage");
    root.appendChild(stage);

    /* nav row */
    const nav = el("div", "carousel__nav");
    const prev = el("button", "os-btn carousel__arrow", "◀");
    const next = el("button", "os-btn carousel__arrow", "▶");
    const counter = el("span", "carousel__counter");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Previous project");
    next.setAttribute("aria-label", "Next project");
    nav.append(prev, counter, next);
    root.appendChild(nav);

    let index = 0;

    function draw() {
      const game = items[index];
      stage.innerHTML = "";

      const card = el("div", "game-card");

      /* media column */
      const media = el("div", "game-card__media");
      const videoWrap = el("div", "game-card__video");
      videoWrap.appendChild(mediaVideo(game.video, "gameplay video"));
      media.appendChild(videoWrap);

      const shots = el("div", "game-card__shots");
      (game.artwork && game.artwork.length ? game.artwork : [""]).forEach((a) =>
        shots.appendChild(mediaImage(a, "artwork"))
      );
      media.appendChild(shots);

      /* text column */
      const info = el("div", "game-card__info");
      info.appendChild(el("h2", "game-card__title", esc(game.title)));
      info.appendChild(el("p", "game-card__desc", esc(game.description)));
      info.appendChild(el("h3", "field-label", "My Work"));
      info.appendChild(el("p", "game-card__role", esc(game.contribution)));

      card.append(media, info);
      stage.appendChild(card);

      counter.textContent = `${index + 1} / ${items.length}`;
      prev.disabled = items.length < 2;
      next.disabled = items.length < 2;
    }

    prev.addEventListener("click", () => {
      index = (index - 1 + items.length) % items.length;
      draw();
    });
    next.addEventListener("click", () => {
      index = (index + 1) % items.length;
      draw();
    });

    draw();
    return root;
  },

  // gallery (art)
  gallery(app) {
    const data = app.data || {};
    const pieces = data.pieces || [];
    const root = el("div", "gallery");

    // header with the artstation link
    const header = el("div", "gallery__header");
    header.appendChild(el("p", "gallery__intro", "Selected Work"));
    if (data.artstationUrl) {
      const a = el("a", "os-btn os-btn--accent", "View full ArtStation ↗");
      a.href = data.artstationUrl;
      a.target = "_blank";
      a.rel = "noopener";
      header.appendChild(a);
    }
    root.appendChild(header);

    if (!pieces.length) {
      root.appendChild(emptyState("No pieces yet", "Add pieces in config.js"));
      return root;
    }

    const grid = el("div", "gallery__grid");
    pieces.forEach((p) => {
      const card = el("div", "art-card");
      const frame = el("div", "art-card__frame");
      frame.appendChild(mediaImage(p.image, "artwork"));
      card.appendChild(frame);

      card.appendChild(el("h3", "art-card__title", esc(p.title)));
      card.appendChild(el("p", "art-card__desc", esc(p.description)));

      if (p.tools && p.tools.length) {
        const tools = el("div", "art-card__tools");
        p.tools.forEach((t) => tools.appendChild(el("span", "tag", esc(t))));
        card.appendChild(tools);
      }

      const link = p.link && p.link.trim() ? p.link : data.artstationUrl;
      if (link) {
        const a = el("a", "art-card__link", "View on ArtStation ↗");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener";
        card.appendChild(a);
      }
      grid.appendChild(card);
    });
    root.appendChild(grid);
    return root;
  },

  // document (about me)
  document(app) {
    const data = app.data || {};
    const root = el("div", "doc");

    root.appendChild(el("h1", "doc__name", esc(data.name)));
    if (data.role) root.appendChild(el("p", "doc__role", esc(data.role)));
    root.appendChild(el("hr", "doc__rule"));

    (data.bio || []).forEach((para) =>
      root.appendChild(el("p", "doc__para", esc(para)))
    );

    if (data.links && data.links.length) {
      const list = el("div", "doc__links");
      data.links.forEach((l) => {
        const a = el("a", "doc__link", esc(l.label));
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener";
        list.appendChild(a);
      });
      root.appendChild(list);
    }

    if (data.resumeUrl && data.resumeUrl.trim()) {
      const dl = el("a", "os-btn os-btn--accent doc__resume", "⬇ Download résumé");
      dl.href = data.resumeUrl;
      dl.setAttribute("download", "");
      root.appendChild(dl);
    } else {
      const disabled = el("span", "os-btn doc__resume doc__resume--off", "Résumé (add a file in config.js)");
      root.appendChild(disabled);
    }

    return root;
  },

  // game / iframe (playable html5 games)
  // runs in a sandboxed iframe so its canvas/scripts/input stay separate from
  // the shell.
  game(app) {
    const data = app.data || {};
    const root = el("div", "game-frame");

    if (!data.src || !data.src.trim()) {
      const ph = placeholder("drop your html5 game here");
      ph.classList.add("placeholder--game");
      root.appendChild(ph);
      return root;
    }

    const frame = document.createElement("iframe");
    frame.className = "game-frame__iframe";
    frame.src = data.src;
    frame.title = app.title;
    frame.setAttribute("allow", "autoplay; fullscreen; gamepad; xr-spatial-tracking");
    frame.setAttribute("allowfullscreen", "");
    // allow-same-origin is needed by most engine exports (asset/WASM loading);
    // drop it if you embed a third-party game.
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-fullscreen allow-forms"
    );
    root.appendChild(frame);
    return root;
  }
};

// "iframe" uses the same renderer (embed any page/app)
RENDERERS.iframe = RENDERERS.game;

function emptyState(title, hint) {
  const box = el("div", "empty-state");
  box.appendChild(el("p", "empty-state__title", esc(title)));
  box.appendChild(el("p", "empty-state__hint", esc(hint)));
  return box;
}

// pick a renderer for an app, with a fallback
function renderApp(app) {
  const fn = RENDERERS[app.type];
  if (typeof fn === "function") return fn(app);
  return emptyState("Unknown layout", `No renderer for type "${app.type}"`);
}

window.renderApp = renderApp;
