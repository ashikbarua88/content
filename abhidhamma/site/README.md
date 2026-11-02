# Abhidhamma: the reading website

A website for reading the Abhidhamma slowly. It is built from the atlas in `../atlas` and follows Bhikkhu Bodhi's *Comprehensive Manual*. The research behind its design is in [RESEARCH.md](RESEARCH.md).

## Pages

| Page | Where it comes from |
| --- | --- |
| **Home** (`/`) | `src/pages/index.astro` |
| **Readings** (`/readings/…`) | Fifteen MDX essays, one per atlas plate, in `src/content/readings/`, in four parts: what there is, how it unfolds, the way out, looking back. |
| **Concepts** (`/concepts/…`) | The atlas's 16 ideas. Each page has its picture, its description, where it sits, the ideas it connects to, its sources in the Canon, stories, and a question to reflect on. The questions are in `src/lib/reflect.js`. |
| **Glossary** | The atlas's 223 terms. |
| **Stories** | The atlas's stories, by level. |
| **Library** | The atlas, its PDF, the nāma–rūpa model, and books. |
| **About** | What the site quotes and what it doesn't, and how discussion works. |
| **Search** | Pagefind. Diacritics are optional: *bhavanga* finds *bhavaṅga*. |

Every Pāli word the glossary knows shows its gloss when you hover over it or tap it; this works without script. Readings have sidenotes in the margin, which become numbered notes you can open on a phone.

## Building

The site needs Node 22.12 or later.

```sh
npm install
npm run dev       # http://localhost:4321 (search works only after a build)
npm run build     # dist/, with the search index
npm run preview
```

`npm run extract` renders the atlas in Chromium, through Playwright as in `../tools/build.js`. It refreshes these generated files:

- `src/data/` (atlas data, idea pictures, plate drawings, sources)
- `src/styles/atlas-tokens.css` (the atlas colours)

Run it after changing the atlas, then commit the results. CI does not need a browser.

## Writing a reading

Add `src/content/readings/<slug>.mdx`. The frontmatter is checked against `src/content.config.ts`. These components are available:

- `<Term>javana</Term>`: a Pāli word with its gloss. Use `g="…"` when the word on the page differs from the glossary headword.
- `<Note>…</Note>`: a sidenote.
- `<Plate sheet="p7" label="…">caption</Plate>`: a drawing from the atlas. Add `wide` to let it run into the margin.

The rules:

- Retell and cite. Do not quote the *Manual*.
- Quote suttas only from Bhikkhu Sujato's public-domain (CC0) translations, and credit them.
- Mark what is commentarial.

## Discussion

Each concept and reading ends with an opening question, a model answer kept closed until the reader opens it, and a giscus thread. giscus uses one GitHub Discussion per page, found by the fixed term `concept:<slug>` or `reading:<slug>`. To turn it on:

1. Enable Discussions in the repository.
2. Install the [giscus app](https://github.com/apps/giscus).
3. Copy the ids from [giscus.app](https://giscus.app) into `src/site.config.mjs`.

## Publishing

`.github/workflows/abhidhamma-pages.yml` builds the site and publishes it with GitHub Pages under `/<repo>/`. It also copies in the atlas, its PDF and the model. Turn Pages on once: *Settings → Pages → Source: GitHub Actions*.
