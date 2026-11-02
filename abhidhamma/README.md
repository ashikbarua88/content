# Abhidhamma study

Two visual companions to Bhikkhu Bodhi's *A Comprehensive Manual of Abhidhamma*, made for slow, deep study.

| What | File | Notes |
| --- | --- | --- |
| **Abhidhamma Atlas**, source | `atlas/` | Edit these files. Open `atlas/index.html` in a browser to read it offline. |
| Abhidhamma Atlas, one file | `abhidhamma-atlas.html` | Built from `atlas/`. Used for the Claude artifact. Do not edit by hand. |
| Abhidhamma Atlas, PDF | `abhidhamma-atlas.pdf` | Built from `atlas/`. 67 A4 pages. |
| Nāma–rūpa model | `nama-rupa-model.html` | A standalone interactive model of mind and matter. |
| **Reading website** | `site/` | The published website: readings, concepts, glossary, stories, search and discussion, built with Astro. See `site/README.md`. |
| Landing page | `index.html` | A one-page index of the companions, kept for offline use. |
| Build tool | `tools/build.js` | Bundles the atlas and prints the PDF. |

## What is in the atlas

- **Start here**: the seven-level learning path, how to study slowly, an 18-week plan, the concept map (clickable, with a path tracer), the map in 3D, every link explained, and the Buddha's life as a map.
- **Seven levels**: fifteen plates, with companion sheets that continue them (2b the twelve bases and eighteen elements, 3b what each citta does, 4b which factors meet which cittas, 7b other processes, 8b chapter VII's lists reduced to their factors, 10b from kamma to its results, 13b the four noble truths and the eightfold path, 14b two moments side by side), from the two truths to other schools' maps. Each level has a level page (what you arrive with, what you leave able to do, questions at three depths), 3D models, and stories from the Buddha's life, the Jātakas and the disciples.
- **Study tools**: one dhamma seen through nine of the Abhidhamma's lists, sixteen identity cards (characteristic, function, manifestation, proximate cause), a review deck of 77 cards in five boxes, and a 150-term glossary.
- **One recurring example**: a moment of seeing a ripe mango and wanting it runs through Plate 7 (a timeline of the 17 mind-moments), Plate 3 (its cittas ringed), Plate 14 (every lens, with a thumbnail of each plate) and the D7 model.

On screen the atlas is interactive. Deep links work: `atlas/#idea-KA` opens *Kamma* on the concept map, `#path-JV-NB` traces a path from *Javana* to *Nibbāna*, `#loop-life` shows the loop of a life. Printed, every sheet is one A4 page.

## Publishing

There are three ways to put the atlas in front of readers. They can be used together.

1. **The Claude artifact.** The atlas is published as a private Claude artifact. Its owner can make it public from the artifact page's *Share* menu; anyone with the link can then read it. To update it, rebuild `abhidhamma-atlas.html` and republish it to the same artifact.
2. **GitHub Pages.** The workflow in `.github/workflows/abhidhamma-pages.yml` builds the reading website in `site/` (with the atlas, PDF and model copied in) whenever this folder changes on `master`. Turn it on once: *Settings → Pages → Build and deployment → Source: GitHub Actions*. The site is then at `https://<owner>.github.io/<repo>/`, with the atlas at `…/atlas/`. Pages on a free account needs a public repository.
3. **The PDF.** Attach `abhidhamma-atlas.pdf` to a GitHub release, or share it from any drive. It needs nothing but a PDF reader.

Readers' progress in the study plan and the review deck is kept in their own browser only. Nothing is collected or shared.

## Building

Needs Node 18 or later. The PDF and the layout check also need Playwright with Chromium:

```sh
npm i -D playwright && npx playwright install chromium
```

Then, from this folder:

```sh
node tools/build.js            # bundle atlas/ into abhidhamma-atlas.html
node tools/build.js --check    # render every sheet and report any that overflow A4
node tools/build.js --pdf      # bundle, and print abhidhamma-atlas.pdf
```

If the three.js CDN is unreachable (some sandboxes block it), pass a local copy: `--three path/to/three.min.js` (three.js r128).

## Changing or adding content

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: words live in `atlas/js/data.js` and `atlas/index.html`; drawings live in `atlas/js/plates.js` and `atlas/js/models3d.js`. Every claim needs a source, every sheet must still fit on an A4 page, and every page must work in both light and dark themes and at phone width.

## License

Not chosen yet. The repository's root `LICENSE` belongs to the CS109 course material elsewhere in the repository and does not cover this folder. A common choice for study material like this is CC BY-SA 4.0 for the text and drawings and MIT for the code; add a `LICENSE` file here once the owner decides.
