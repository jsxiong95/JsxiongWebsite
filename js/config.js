/* ============================================================================
 *  config.js  —  THE CENTRAL REGISTRY  (data only, no logic)
 * ============================================================================
 *  This is the ONLY file you need to touch to add, remove, or edit apps.
 *  Add a new object to the APPS array and the desktop icon, window, start-menu
 *  entry, and taskbar tab are all generated automatically.
 *
 *  Each app object:
 *    id        unique string, no spaces            (e.g. "music")
 *    title     label shown under the icon + tab    (e.g. "music")
 *    icon      path to a pixel-art PNG for the icon (see assets/icons/)
 *    width     opening window width  in px
 *    height    opening window height in px
 *    type      which renderer to use:
 *                "carousel" | "gallery" | "document"   (content layouts)
 *                "game" | "iframe"                      (embed a playable app)
 *                "link"                                 (open a URL, no window)
 *    data      content for that renderer (shape depends on `type`, see below)
 *
 *  OPTIONAL per-app fields:
 *    multi     true  -> every launch opens a NEW window/process (e.g. games)
 *              false -> single window; clicking the icon refocuses it (default)
 *    flush     true  -> body has no padding (set automatically for game/iframe)
 *
 *  MEDIA PLACEHOLDERS
 *    Leave any image / video path as an empty string ("") to show a labeled
 *    placeholder box. Drop in your real file path when ready and it appears.
 *    Image paths get an automatic fallback to a placeholder if the file is
 *    missing, so a wrong path never shows a broken-image icon.
 * ========================================================================== */

const APPS = [

  /* ----------------------------------------------------------------------
   *  GAMES  —  carousel of projects
   *  data.items[] = { title, description, contribution, artwork[], video }
   *    artwork : array of image paths (drop in assets/games/)
   *    video   : single video path  (drop in assets/games/), "" = placeholder
   * -------------------------------------------------------------------- */
  {
    id: "games",
    title: "games",
    icon: "assets/icons/games.png",
    width: 760,
    height: 560,
    type: "carousel",
    data: {
      items: [
        {
          title: "PROJECT ONE",
          description:
            "A short pitch for the game goes here — genre, hook, platform, " +
            "and the feeling you wanted players to walk away with.",
          contribution:
            "What you specifically built: systems, levels, tools, pipelines. " +
            "Be concrete — “designed the combat loop and authored 12 levels.”",
          artwork: ["", ""],          // e.g. ["assets/games/p1-key.png", "assets/games/p1-screen.png"]
          video: ""                   // e.g. "assets/games/p1-gameplay.mp4"
        },
        {
          title: "PROJECT TWO",
          description:
            "Second project blurb. Keep it to a couple of sentences so the " +
            "card stays scannable.",
          contribution:
            "Your role on this one. Mention team size and what you owned.",
          artwork: ["", ""],
          video: ""
        },
        {
          title: "PROJECT THREE",
          description:
            "Third project blurb. Swap in as many or as few projects as you " +
            "like — the carousel sizes itself to the list.",
          contribution:
            "Your role here. Link the impact: shipped, awards, downloads.",
          artwork: [""],
          video: ""
        }
      ]
    }
  },

  /* ----------------------------------------------------------------------
   *  ART  —  gallery grid
   *  data.artstationUrl : your default profile link
   *  data.pieces[] = { title, image, description, tools[], link }
   *    image : path (drop in assets/art/), "" = placeholder
   *    tools : array of strings, e.g. ["Photoshop", "Aseprite"]
   *    link  : optional per-piece link; falls back to artstationUrl
   * -------------------------------------------------------------------- */
  {
    id: "art",
    title: "art",
    icon: "assets/icons/art.png",
    width: 820,
    height: 600,
    type: "gallery",
    data: {
      artstationUrl: "https://www.artstation.com/your-profile-here",
      pieces: [
        {
          title: "Piece One",
          image: "",                  // e.g. "assets/art/piece1.png"
          description: "A line about the piece — brief, medium, or the idea.",
          tools: ["Photoshop", "Aseprite"],
          link: ""                    // optional direct link to this piece
        },
        {
          title: "Piece Two",
          image: "",
          description: "Another short caption.",
          tools: ["Procreate"],
          link: ""
        },
        {
          title: "Piece Three",
          image: "",
          description: "Another short caption.",
          tools: ["Blender", "Substance"],
          link: ""
        },
        {
          title: "Piece Four",
          image: "",
          description: "Another short caption.",
          tools: ["Krita"],
          link: ""
        }
      ]
    }
  },

  /* ----------------------------------------------------------------------
   *  ABOUT ME  —  document
   *  data.name     : heading
   *  data.role     : subheading / tagline
   *  data.bio[]    : array of paragraphs
   *  data.resumeUrl: path to your resume file (drop in assets/), "" disables
   *  data.links[]  : optional { label, url } contact rows
   * -------------------------------------------------------------------- */
  {
    id: "about",
    title: "about me",
    icon: "assets/icons/about.png",
    width: 560,
    height: 600,
    type: "document",
    data: {
      name: "YOUR NAME",
      role: "Game Developer · Pixel Artist",
      bio: [
        "Write a couple of friendly sentences about who you are and what " +
          "you make. Keep the first line strong — it’s the hook.",
        "A second paragraph for background: where you’ve worked, what you " +
          "care about, and the kind of projects you want next."
      ],
      resumeUrl: "",                  // e.g. "assets/resume.pdf"
      links: [
        { label: "Email", url: "mailto:you@example.com" },
        { label: "GitHub", url: "https://github.com/your-handle" }
      ]
    }
  },

  /* ----------------------------------------------------------------------
   *  PLAYABLE GAME  —  template (duplicate this block per game)
   *  Put your exported game in its own folder, e.g.  games/mygame/index.html
   *  (a Construct/Phaser/Godot/PICO-8/Kaboom/plain-canvas export), then point
   *  data.src at that index.html. Each click launches its own window/process.
   * -------------------------------------------------------------------- */
  {
    id: "mygame",
    title: "my game",
    icon: "assets/icons/mygame.png",   // a cartridge PNG for this game
    width: 820,
    height: 640,
    type: "game",
    multi: true,                        // allow multiple play sessions at once
    data: {
      src: ""                           // e.g. "games/mygame/index.html"
    }
  }

  /* ----------------------------------------------------------------------
   *  EXTRA ICON IDEAS (uncomment / adapt):
   *
   *  // A desktop shortcut that opens an external link in a new tab:
   *  ,{
   *    id: "itch", title: "itch.io", icon: "assets/icons/itch.png",
   *    type: "link", data: { url: "https://your-name.itch.io" }
   *  }
   * -------------------------------------------------------------------- */

];

/* ============================================================================
 *  SYSTEM  —  start-menu identity, pinned links, themes, run-dialog jokes
 *  Data only; the engine (os.js) renders all of this. Edit freely.
 * ========================================================================== */
const SYSTEM = {

  /* Banner at the top of the start menu */
  user: {
    name: "YOUR NAME",
    status: "online \u00B7 open to work",
    avatar: "assets/icons/avatar.png"   // square pixel portrait; "" -> initial letter
  },

  /* Text on the boot / power-on splash */
  boot: { title: "PORTFOLIO OS", subtitle: "v1.0  \u2014  press start" },

  /* Pinned links (open in a new tab). Swap in your real URLs. */
  links: [
    { label: "GitHub",     url: "https://github.com/your-handle" },
    { label: "ArtStation", url: "https://www.artstation.com/your-profile-here" },
    { label: "itch.io",    url: "https://your-name.itch.io" },
    { label: "Email",      url: "mailto:you@example.com" }
  ],

  /* Desktop colour themes. Each key in `vars` maps to a CSS variable; the first
     theme is the default. Add your own — only the listed vars are swapped. */
  themes: [
    { id: "teal",    name: "Teal (default)", vars: { "--desktop": "#3fb6c6", "--purple": "#5b3fa0", "--purple-hi": "#8a63d6", "--accent": "#ff4d8d", "--accent-2": "#ffd23f", "--blue": "#3c7bd4" } },
    { id: "sunset",  name: "Sunset",         vars: { "--desktop": "#e98a5b", "--purple": "#7d3a86", "--purple-hi": "#b95ca6", "--accent": "#ff5d73", "--accent-2": "#ffd23f", "--blue": "#e0556e" } },
    { id: "matrix",  name: "Matrix",         vars: { "--desktop": "#0f3d24", "--purple": "#1f7a44", "--purple-hi": "#39d353", "--accent": "#39d353", "--accent-2": "#a6ff00", "--blue": "#1f7a44" } },
    { id: "grape",   name: "Grape Soda",     vars: { "--desktop": "#6d5acd", "--purple": "#3b2a78", "--purple-hi": "#7d6be0", "--accent": "#ff6ad5", "--accent-2": "#ffe34d", "--blue": "#5a8af0" } },
    { id: "gameboy", name: "Game Boy",       vars: { "--desktop": "#8bac0f", "--purple": "#306230", "--purple-hi": "#9bbc0f", "--accent": "#306230", "--accent-2": "#0f380f", "--blue": "#306230" } }
  ],

  /* Easter-egg replies for the Run… dialog. Keys are lowercased commands.
     Anything not here that matches an app id/title launches that app instead.
     Built-ins already handled: <app name>, "theme <name>", shutdown, restart, clear. */
  run: {
    help:   "commands: <app name>, theme <name>, shutdown, restart, clear, help",
    hello:  "Hello, user. :)",
    hi:     "Hello, user. :)",
    whoami: "GUEST  (privileges: visitor)",
    coffee: "brewing... \u2615  task failed successfully",
    ls:     "games   art   about   mygame",
    dir:    "games   art   about   mygame"
  }

};

/* Make available to the renderers + engine (both load after this file). */
window.APPS = APPS;
window.SYSTEM = SYSTEM;
