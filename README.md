# Push Present

A mobile FFXIV-inspired static site where Lulu can compare researched products
and choose one push present from each category.

## Contents

- [Run locally](#run-locally)
- [GitHub Pages](#github-pages)
- [Product catalog](#product-catalog)
- [Selection sync](#selection-sync)
- [Safety notes](#safety-notes)
- [Project files](#project-files)

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

The site is plain HTML, CSS, and JavaScript. GitHub Pages can publish it directly
from the repository root without a build step.

## Product catalog

The catalog contains 30 purchase candidates across eight categories. Each
category renders as a horizontal swipe deck with product photos, current prices,
specifications, research notes, and direct retailer or maker links. Prices and
availability were researched on August 27, 2026, and may change.

Catalog data is maintained in `product-data.js`. Product images are stored in
`assets/products/` when a stable retailer or manufacturer image was available.

## Selection sync

Lulu can choose zero or one product in each category. Supabase enforces the same
one-choice-per-category rule in the database. Choices sync through an unguessable
list ID and access token in the shared URL fragment. Direct table access is
disabled. Browser local storage keeps the current choices available on the
original device.

## Safety notes

- Refrigerators listed for breast milk use compressor cooling. Confirm the unit
	holds `40°F / 4°C` or colder with an appliance thermometer before use.
- Baby sleep options are floor-standing bassinets, portable cribs, or play yards.
	Use a firm, flat surface with a fitted sheet only and never place one on a desk
	or tabletop.

## Project files

- `index.html`: page structure
- `styles.css`: mobile-first design
- `product-data.js`: researched product categories and purchase links
- `app.js`: swipe decks, sharing, and synchronized category choices
- `supabase-config.js`: public browser connection settings
- `supabase/`: database configuration and migrations
- `assets/ffxiv/`: official FINAL FANTASY XIV Fan Kit materials
- `assets/products/`: locally hosted product images

Character portraits are unmodified in-game materials sourced through the Final
Fantasy XIV Console Games Wiki. All game materials remain © SQUARE ENIX.

FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
FINAL FANTASY XIV materials © SQUARE ENIX.
