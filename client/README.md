NodeJS Game — Client

Overview
- Browser client for the NodeJS game.
- Built with Webpack; source lives in `src/` and static assets in `assets/`.

Quick start
- Install dependencies and build the client bundle:

```bash
npm install
npm run build    # builds with webpack
npm run watch    # optional: rebuild on changes
npm run start    # shorthand for webpack (serves/build depending on your setup)
```

Project structure (client)
- src/
  - index.js — application entry
  - Auth.js, State.js, Settings.js — core client state and auth
  - Renderer.js — canvas rendering & draw loop
  - control/ — input handlers (KeyControl, TouchControl, PlayerControl, SocketControl)
  - events/ — socket event handlers and senders
  - UI/ — UI components (Chat, Inventory, Login, SkillTree, etc.)
  - sprites/ — Sprite classes and collections
  - utils/ — small helpers (Image, Observable, draggable, etc.)
  - locale/ — localization JSON and loader
- assets/ — maps, sprites and other static assets used by the client
- webpack.config.js — build configuration
- shared/, data/, enum/, models/, utils/, websocket/ — code shared with server and domain data (items, mobs, models, packet definitions)

Notes
- Webpack produces the client bundle; open the built `index.html` (or serve via a static server) to run the client in a browser.
- For local development, use `npm run watch` and a static server that points to the output directory.
- Check `package.json` in the client folder for exact scripts and versions.
