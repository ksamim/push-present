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
- `app.js`: ideas, filters, and device-local saved choices
- `assets/ffxiv/`: official FINAL FANTASY XIV Fan Kit materials

Saved choices use browser local storage and remain on the device where they were
selected. The Share button sends the current shortlist through the device share
sheet. Cross-device automatic syncing requires an external data service.

FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
FINAL FANTASY XIV materials © SQUARE ENIX.
