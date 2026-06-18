// config.js
// App list (APPS) and system settings (SYSTEM). Data only, no logic.

const APPS = [

  // games carousel
  {
    id: "games",
    title: "Games",
    icon: "assets/icons/games.png",
    width: 760,
    height: 560,
    type: "carousel",
    data: {
      items: [
        {
          title: "Ghost for Hire",
          description:
            "Ghost for Hire is an eight-person team project where you play " +
            "as a ghost hired to scare humans out of an area.",
          contribution:
            "I worked mostly on gameplay: implementing the designed abilities, " +
            "handling player controls, and catching the edge cases those " +
            "abilities introduced. I also did the majority of the UI " +
            "programming, using a mix of C++ and Blueprints. For example, I " +
            "wrote several custom functions in the C++ widget class to handle " +
            "complex logic, then exposed them so my teammates could call them " +
            "for UI needs like ability checks, icon changes, and value tweaks.",
          artwork: ["", ""],
          video: ""
        },
        {
          title: "Spellgun Sprint",
          description:
            "Spellgun Sprint is a high-fantasy speedrun shooter that mixes " +
            "guns and magic. You're a wizard-artificer who has just been " +
            "kicked out of your own tower by a meddling druid set on " +
            "destroying your life's work. Use your Spellgun technology to " +
            "fight back and reclaim your home. Time is of the essence!",
          contribution:
            "I worked on character models, hero assets, and lighting.",
          artwork: ["", ""],
          video: ""
        },
        {
          title: "The Collector",
          description:
            "The Collector is a platformer where you play a thief making your " +
            "escape from the city, helping yourself to a few valuables on the " +
            "way out.",
          contribution:
            "This was a solo project and my first ever in Unreal Engine. I " +
            "learned to create complex actors, work with node-based shaders, " +
            "and get to grips with Blueprints. I built a rudimentary AI that " +
            "attacks the player when they are in sight and lit. To do it, I " +
            "made a collision box covering the lit area and tied the AI's " +
            "behaviour and movement to that box, which sold the illusion that " +
            "the enemy could only see the player in the light. The AI had " +
            "three states: patrol, chase, and attack. It patrolled while the " +
            "player was unseen, closed the distance when the player was " +
            "spotted but far off, and attacked once in range, dealing damage " +
            "until the player broke line of sight.",
          artwork: [""],
          video: ""
        }
      ]
    }
  },

  // art gallery
  {
    id: "art",
    title: "Art",
    icon: "assets/icons/art.png",
    width: 820,
    height: 600,
    type: "gallery",
    data: {
      artstationUrl: "https://www.artstation.com/your-profile-here",
      pieces: [
        {
          title: "Piece One",
          image: "",
          description: "A line about the piece, the brief, medium, or idea.",
          tools: ["Photoshop", "Aseprite"],
          link: ""
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

  // about me document
  {
    id: "about",
    title: "About Me",
    icon: "assets/icons/about.png",
    width: 560,
    height: 600,
    type: "document",
    data: {
      name: "YOUR NAME",
      role: "Game Developer, 3D Artist, Technical Artist, Programmer",
      bio: [
        "I'm a game developer with a Master of Science, working across " +
          "gameplay programming, 3D art, and technical art. I'm happy taking " +
          "a feature from design to a shipped, edge-case-proof build, and I " +
          "like sitting in the overlap between engineering and art where the " +
          "two have to meet.",
        "In Unreal Engine I've built complex actors, node-based shaders, and " +
          "stateful enemy AI, and I work fluently across C++ and Blueprints, " +
          "often writing custom C++ functions that give teammates clean hooks " +
          "to build on. On the art side I've handled character models, hero " +
          "assets, and lighting; on the programming side I've owned gameplay " +
          "systems, player controls, and UI. Recent projects span an " +
          "eight-person team game (Ghost for Hire), a fast-paced fantasy " +
          "shooter (Spellgun Sprint), and a solo Unreal platformer (The " +
          "Collector)."
      ],
      resumeUrl: "",
      links: [
        { label: "Email", url: "mailto:you@example.com" },
        { label: "GitHub", url: "https://github.com/your-handle" }
      ]
    }
  },

  {
    id: "mygame",
    title: "My Game",
    icon: "assets/icons/mygame.png",
    width: 820,
    height: 640,
    type: "game",
    multi: true,
    data: {
      src: ""
    }
  }

];

// SYSTEM
// start-menu identity, pinned links, themes, run-dialog replies.
// data only, os.js renders all of it.
const SYSTEM = {

  // start-menu banner
  user: {
    name: "YOUR NAME",
    status: "Online \u00B7 Open to work",
    avatar: "assets/icons/avatar.png"
  },

  // boot splash text
  boot: { title: "PORTFOLIO OS", subtitle: "v1.0  \u2014  press start" },

  // pinned links (open in a new tab)
  links: [
    { label: "GitHub",     url: "https://github.com/your-handle" },
    { label: "ArtStation", url: "https://www.artstation.com/your-profile-here" },
    { label: "itch.io",    url: "https://your-name.itch.io" },
    { label: "Email",      url: "mailto:you@example.com" }
  ],

  // colour themes
  themes: [
    { id: "teal",    name: "Teal (default)", vars: { "--desktop": "#3fb6c6", "--purple": "#5b3fa0", "--purple-hi": "#8a63d6", "--accent": "#ff4d8d", "--accent-2": "#ffd23f", "--blue": "#3c7bd4" } },
    { id: "sunset",  name: "Sunset",         vars: { "--desktop": "#e98a5b", "--purple": "#7d3a86", "--purple-hi": "#b95ca6", "--accent": "#ff5d73", "--accent-2": "#ffd23f", "--blue": "#e0556e" } },
    { id: "matrix",  name: "Matrix",         vars: { "--desktop": "#0f3d24", "--purple": "#1f7a44", "--purple-hi": "#39d353", "--accent": "#39d353", "--accent-2": "#a6ff00", "--blue": "#1f7a44" } },
    { id: "grape",   name: "Grape Soda",     vars: { "--desktop": "#6d5acd", "--purple": "#3b2a78", "--purple-hi": "#7d6be0", "--accent": "#ff6ad5", "--accent-2": "#ffe34d", "--blue": "#5a8af0" } },
    { id: "gameboy", name: "Game Boy",       vars: { "--desktop": "#8bac0f", "--purple": "#306230", "--purple-hi": "#9bbc0f", "--accent": "#306230", "--accent-2": "#0f380f", "--blue": "#306230" } }
  ],

  // run dialog replies
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

// renderers + engine load after this file
window.APPS = APPS;
window.SYSTEM = SYSTEM;
