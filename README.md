# Push Present

A mobile FFXIV-inspired static site for browsing and saving push present ideas.

## Contents

- [Run locally](#run-locally)
- [GitHub Pages](#github-pages)
- [Project files](#project-files)

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

The site is plain HTML, CSS, and JavaScript. GitHub Pages can publish it directly
from the repository root without a build step.

## Project files

- `index.html`: page structure
- `styles.css`: mobile-first design
- `app.js`: gift options, filters, sharing, and synchronized favorites
- `supabase-config.js`: public browser connection settings
- `supabase/`: database configuration and migrations
- `assets/ffxiv/`: official FINAL FANTASY XIV Fan Kit materials

Character portraits are unmodified in-game materials sourced through the Final
Fantasy XIV Console Games Wiki. All game materials remain © SQUARE ENIX.

Favorites sync through Supabase using an unguessable list ID and access token in
the shared URL fragment. Direct table access is disabled. Browser local storage
keeps the current list available on the original device.

FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
FINAL FANTASY XIV materials © SQUARE ENIX.
