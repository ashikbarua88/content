# Abhidhamma: the reading website

A website for reading the Abhidhamma slowly. It is built from the atlas in `../atlas` and follows Bhikkhu Bodhi's *Comprehensive Manual*. The research behind its design is in [RESEARCH.md](RESEARCH.md).

## Pages

| Page | Where it comes from |
| --- | --- |
| **Home** (`/`) | `src/pages/index.astro` |
| **Readings** (`/readings/…`) | Twenty-three MDX essays in `src/content/readings/`, in four parts (what there is, how it unfolds, the way out, looking back): one per atlas plate, and one per companion sheet (2b, 3b, 4b, 7b, 8b, 10b, 13b, 14b). |
| **Dhammas** (`/dhammas/…`) | 104 entries: the 52 mental factors, 28 kinds of matter and 24 conditions. Descriptions are in `src/content/dhammas/`; counts and lists are in `src/data/structure.json`. The glossary links to them. |
| **Explore** | The atlas's concept map, with each idea linked to its page and its connections lit on hover, and links to the 3D models. |
| **Concepts** (`/concepts/…`) | The atlas's 16 ideas. Each page has its picture, its description, where it sits, the ideas it connects to, its sources in the Canon, stories, and a question to reflect on. Everything on the page is in `src/content/concepts/<slug>.md`. |
| **Glossary** | The atlas's 223 terms. |
| **Stories** | The atlas's stories, by level. |
| **Library** | The atlas, its PDF, the nāma–rūpa model, and books. |
| **About** | What the site quotes and what it doesn't, and how discussion works. |
| **Search** | Pagefind. Diacritics are optional: *bhavanga* finds *bhavaṅga*. |

Every Pāli word the glossary knows shows its gloss when you hover over it or tap it; this works without script. Readings have sidenotes in the margin, which become numbered notes you can open on a phone.

## Where the words live

The website is the single source of truth. Every word is in `src/content/`, never in a `.js` file. Edit a file there and rebuild; the site and the book PDF both change.

| Text | File |
| --- | --- |
| Readings (essays) | `src/content/readings/<slug>.mdx` |
| The sixteen ideas: definition, long description, sources in the Canon, question and answer | `src/content/concepts/<slug>.md` |
| The sentences on the links between ideas | `src/content/links.yaml` |
| Mental factors, matter, conditions: descriptions and four-part definitions | `src/content/dhammas/factors.yaml`, `matter.yaml`, `conditions.yaml` |
| How the three lists are introduced and grouped | `src/content/dhammas/kinds.yaml` |
| Glossary | `src/content/glossary.yaml` |
| Stories | `src/content/stories.yaml` |
| Levels; the parts that group concepts and readings | `src/content/levels.yaml`, `parts.yaml` |
| Page chrome (home, about, library) | `src/pages/*.astro` |
| Figures: drawing code, and the tables they draw | `src/figures/<name>.js`, `src/data/figures/<name>.json` |
| 3D models: their titles, captions and markup | `src/content/models3d.yaml`; the scenes in `src/scripts/models3d.js` (three.js r128) |

Tables that are not prose are in `src/data/structure.json`: the following.

- link types
- plate titles
- chapter references to the *Manual*
- counts of factors in cittas
- the chapter VII lists

The site draws its own figures at build time (`src/figures/`, used as `<Figure name="…">` in a reading). Every reading's figure is drawn by the site. Only the idea pictures, their animations and the concept map are still copied from the atlas, through `npm run extract`, which copies pictures only, never text; they are next to be redrawn. The atlas itself, in `../atlas`, is left as it is. The site no longer reads its text.

## The book

`/book/` is the whole site as one document. The build prints it to `dist/abhidhamma-book.pdf` (`tools/export-book.mjs`, needs Playwright). Every reading and concept page also has a *Save as PDF* button.

If Playwright is missing, the build still succeeds without the PDF; the book page can then be printed from the browser.

## Building

The site needs Node 22.12 or later.

```sh
npm install
npm run dev       # http://localhost:4321 (search works only after a build)
npm run build     # dist/, with the search index
npm run preview
```

`npm run extract` copies the atlas's drawings, never its text. It renders the atlas in Chromium, through Playwright as in `../tools/build.js`, and writes these files:

- `src/data/pictures.json`: the idea pictures.
- `src/data/plates.json`: the plate drawings.
- `src/data/map.json`: the concept map.
- `public/js/pictures.js`: the pictures' animations.
- `src/styles/atlas-tokens.css`: the colours.

Run it only after the atlas's drawings change, then commit the results.

`node tools/render-models.mjs`, run after a build, refreshes the 3D previews on Explore (`public/models/`).

The build itself needs a browser only for the book PDF, which CI installs.

## Writing a reading

Add `src/content/readings/<slug>.mdx`. The frontmatter is checked against `src/content.config.ts`. These components are available:

- `<Term>javana</Term>`: a Pāli word with its gloss. Use `g="…"` when the word on the page differs from the glossary headword.
- `<Note>…</Note>`: a sidenote.
- `<Plate sheet="p7" label="…">caption</Plate>`: a drawing from the atlas. Add `wide` to let it run into the margin.

The rules:

- Retell and cite. Do not quote the *Manual*.
- Quote suttas only from Bhikkhu Sujato's public-domain (CC0) translations, and credit them.
- Mark what is commentarial.

## Accounts, discussion and reflection

Every concept and reading ends with:
- the opening question
- a private journal box for the reader's own answer, saved in their browser and, when signed in, in their account
- the model answer, kept closed
- a discussion thread for the page

Readers sign in with Google, GitHub or email at `/account/`, and find all their answers at `/reflections/`, where they can export them.

All of this runs on Supabase: the schema and access rules are in `supabase/schema.sql`, and setup is in [supabase/README.md](supabase/README.md). The browser code is `src/scripts/community.js`. Without a Supabase project the site still builds and the journal still works, kept in the browser.

## Publishing

`.github/workflows/abhidhamma-pages.yml` builds the site and publishes it with GitHub Pages under `/<repo>/`. It also copies in the atlas, its PDF and the model. Turn Pages on once: *Settings → Pages → Source: GitHub Actions*.
