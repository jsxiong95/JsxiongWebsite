# Portfolio OS

A portfolio site that behaves like a retro pixel-art desktop. Icons open
draggable windows, the taskbar tracks running "processes," the Start menu lists
your apps, and a live clock ticks in the corner.

## Run it

It's plain HTML/CSS/JS — no build step. Because the scripts load via relative
paths, open it through a tiny local server rather than double-clicking the file:

```bash
cd retro-os-portfolio
python3 -m http.server 8000
# then visit http://localhost:8000
```

## File map

```
retro-os-portfolio/
├─ index.html          shell + font links + script order
├─ css/styles.css      all styling (palette tokens live at the top)
├─ js/config.js        DATA  — the central registry. Edit this to add apps.
├─ js/renderers.js     VIEW  — one function per layout type
├─ js/os.js            ENGINE — windows, dragging, taskbar, start menu, clock
└─ assets/
   ├─ icons/           desktop / titlebar / taskbar icons  (PNG)
   ├─ games/           game artwork + gameplay videos
   └─ art/             gallery images
```

The three layers are independent: `config.js` holds only data, `renderers.js`
turns data into DOM, and `os.js` knows nothing about any specific app.

## Where to drop your assets

Everything is wired up with **empty-string placeholders**. Put a real path in
`js/config.js` and the file appears; leave it `""` and a labeled placeholder box
shows instead. Missing image paths fall back to a placeholder automatically, so
a typo never shows a broken-image icon.

| Slot | Put files in | Set in config.js |
|------|--------------|------------------|
| Desktop icons (cartridge / cube / clipboard) | `assets/icons/` | each app's `icon` |
| Game artwork | `assets/games/` | a game's `artwork: [ ... ]` |
| Gameplay video | `assets/games/` | a game's `video` |
| Art images | `assets/art/` | a piece's `image` |
| Résumé file | `assets/` | About Me `resumeUrl` |

Recommended icon size: a square PNG, 96×96 or larger. Pixel art stays crisp —
images use `image-rendering: pixelated`.

## Add a brand-new app

Append one object to the `APPS` array in `js/config.js`:

```js
{
  id: "music",
  title: "music",
  icon: "assets/icons/music.png",
  width: 640, height: 480,
  type: "document",        // reuse an existing layout...
  data: { /* ...its content */ }
}
```

The icon, window, Start-menu entry, and taskbar tab all generate themselves.

To invent a **new layout**, add a key to `RENDERERS` in `js/renderers.js`
(e.g. `timeline(app) { ... }`) and reference it as that app's `type`.

## Customising the look

Open `css/styles.css` — the palette and the taskbar height are CSS variables in
the `:root` block at the very top. Change a few hex values there to retheme the
whole OS.
