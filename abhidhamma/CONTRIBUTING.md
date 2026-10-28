# Contributing to the Abhidhamma Atlas

The atlas is meant to grow: more plates, more stories, more links, corrections. This guide says where everything lives and what a change must keep true.

## Four rules

1. **Every claim has a source.** Name it on the page (the footer of a plate, the `src` of a story, the caption of a drawing). Use canonical references (DN, MN, SN, AN, Vin, Dhs, Vibh, Paṭṭh), the commentaries (Atthasālinī, Visuddhimagga), or the standard manuals (Bodhi's *CMA*, Nārada, Karunadasa). Say so when a story comes only from a commentary. When the atlas reads a story or draws a connection itself, mark it as a study aid, as the story pages do.
2. **Every sheet fits on one A4 page.** Run `node tools/build.js --check` after any change; it lists the sheets that overflow.
3. **Both themes, any width.** Colours come from the tokens at the top of `atlas/atlas.css`; never write a literal colour into a drawing. Check the page at about 400 px wide in dark mode as well as on a desktop in light mode.
4. **Colour carries meaning.** Indigo is mind, turmeric is matter, teal is Nibbāna and the path, red is unwholesome. The seven levels have their own scale, `--lv1` to `--lv7`.

## Where things live

```
atlas/
  index.html        markup of every sheet, in reading order (section.sheet, one per A4 page)
  atlas.css         design tokens (light and dark) and all styles
  js/data.js        the words: plates, levels, threads, ideas and links, stories, glossary,
                    Plate 2's aggregates, the study method and plan, the explorer, the deck
  js/plates.js      the 2D drawings on plates 1 to 15
  js/learn.js       level pages, the navigation strip on each plate, contents, stories, page numbers
  js/maps.js        the concept maps (main and per level), the link matrix and list, deep links
  js/study.js       the study method, plan tracker, explorer, identity cards and review deck
  js/models3d.js    every 3D model (three.js r128 from cdnjs), drawn through one shared renderer
tools/build.js      bundles atlas/ into abhidhamma-atlas.html and prints abhidhamma-atlas.pdf
```

Scripts load in the order listed in `atlas/index.html`. `data.js` sets `window.ATLAS`; every other script reads from it.

## Recipes

### Correct a fact or a sentence

Find the text with a search across `atlas/`. Text on a sheet's static parts is in `index.html`; text generated for many pages (level pages, stories, links, cards) is in `js/data.js`.

### Add a story

Add an object to `D.stories[level]` in `data.js`:

```js
{ k: "jataka",                 // "life", "jataka" or "disc" (disciples): sets the label and colour
  t: "Title",
  src: "Ja 313",               // where the story is told
  s: "The story, retold in a few sentences.",
  r: "Reading it with the atlas: which plate it illustrates, and how.",
  p: [4, 10],                  // plates the reading refers to
  q: "A Reflect question." }
```

Each story page holds four to six stories; if a level's page overflows, move one to another level or shorten the retellings. To place a story on the life map, add a row to `D.lifePast` or `D.lifeLast`: `[title, what happens, source or age, plates, level of its story page or 0]`.

### Add an idea or a link to the concept map

Ideas are in `D.ideas`:

```js
{ id: "KA", c: "--kamma", lv: 5, t: "Kamma", s: "volition",
  d: "One-line description shown in the panel and the 3D caption.", p: [10],
  map: { x: 490, y: 460, w: 130 },   // box centre and width on the 2D map (viewBox 680 × 610; rows at y 46, 140, 250, 355, 460, 565)
  orbit: 250 }                        // angle on its level's floor in the 3D map; null puts it in the centre
```

Links are in `D.links`:

```js
{ from: "JV", to: "KA", type: "kam",  // type is a key of D.linkTypes and sets the colour
  label: "its volition is kamma",     // the arrow read as a sentence: Javana, its volition is kamma, Kamma
  text: "One sentence that explains the link.", p: [7, 10],
  map: { d: "M500 270 L500 438", l: "its volition\nis kamma", lx: 507, ly: 322, a: "start" } }
```

`map` is the arrow on the 2D map: an SVG path, the label's lines, its position and anchor (`rot: 1` turns it vertical, `both: 1` puts arrowheads at both ends). Set `map: null` and the link is drawn as a dashed curve, only while one of its ideas is chosen; the 3D map, the matrix, the list, the panel and the path tracer pick up every link automatically. Links are addressed by their position in the list (`#link-14`), so add new ones at the end.

### Add a dhamma to the explorer, or an identity card

Add an object to `D.dhammas`. The nine lenses use these values:

| field | values |
| --- | --- |
| `real` | `citta`, `cetasika`, `rūpa`, `Nibbāna` |
| `agg` | `consciousness`, `feeling`, `perception`, `formations`, `form`, `none` |
| `base`, `el` | the base and element it belongs to, in words |
| `truth` | `suffering`, `origin`, `cessation`, `suffering¹` (mundane occurrences only), `suffering¹ · path` |
| `kind` | `wholesome`, `unwholesome`, `indeterminate`, `wholesome²` (or indeterminate), `varies` |
| `res` | `result`, `productive`, `neither`, `varies` |
| `root`, `obj` | `1` or `0` |

`card` is `[characteristic, function, manifestation, proximate cause]`; leave it out if the commentaries give none. `notice` is one sentence on how to recognise it in experience. The identity card page shows every dhamma that has a `card`; it holds sixteen.

### Add review cards

Add `[level, question, answer]` rows to `D.deck`. Keep answers short enough to say aloud. The printed deck page holds about six per level.

### Add a plate

1. Add a `<section class="sheet" id="p16">` to `index.html`, after the plates of its level, with the same parts as its neighbours: `.ph` header, `h2`, `.lede`, the figure, and a `.pf` footer with its sources and `<span class="pg"></span>`.
2. Register it in `D.plates` (title, short name, level, one-line summary), add it to its level's `plates` in `D.levels`, and say what it builds on in `D.builds`.
3. Draw it in `plates.js`, in its own `(function () { … })();` block that writes into an element id on the plate. Use the `T()` helper and the `tx-*` classes; take colours from tokens.
4. Run `node tools/build.js --check`.

The contents, the navigation strip, the taxonomy table, the dependency graph and the page numbers all update themselves.

### Add a 3D model

Add a `<div class="viz3d" id="…">` to the sheet, then a block in `models3d.js` that calls `make3D(id, options)` and builds into `S.root`. Use `stdMat`, `basicMat` and `lineMat` with colour tokens so the model follows the theme, and `label()` for text. Models are drawn through one shared WebGL renderer, so there is no limit on how many a page has; `window.__render3dAll()` draws them all for printing.

## Before you send a change

- `node tools/build.js --pdf` runs without page errors and reports that every sheet fits.
- The page works at about 400 px in dark mode, with no sideways scrolling of the page itself.
- New claims have sources, and new readings are marked as study aids.
