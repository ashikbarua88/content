# Research before the website

Notes gathered on 2 November 2026, before building the reading website. Each section ends with the decision it led to.

## 1. Rights: what the site may quote

- **Bhikkhu Bodhi's *Comprehensive Manual*** is © Buddhist Publication Society (1993, 1997, 2006), all rights reserved. Its tables were also used under permission from the Pali Text Society and U Sīlānanda. The online DharmaNet copy was made "with the kind permission" of BPS and is not licensed for reuse. ([BPS](https://bps.lk/book/the-comprehensive-manual-of-abhidhamma), [Wikipedia on BPS](https://en.wikipedia.org/wiki/Buddhist_Publication_Society))
- **SuttaCentral's own translations** are CC0: "if the translations were made by SuttaCentral's own translators, they are uniformly under CC0". That covers Bhikkhu Sujato's suttas and Ajahn Brahmali's Vinaya. SuttaCentral's older "legacy" translations carry other licences, and Bodhi's and Ṭhānissaro's translations are not CC0. ([SuttaCentral forum](https://discourse.suttacentral.net/t/bhante-sujatos-translations-copyright-on-publication-details-tab/11003), [ReadingFaithfully](https://daily.readingfaithfully.org/copyright/))
- **The Digital Pāḷi Dictionary** is licensed for non-commercial use only. The licence may also be share-alike: the docs site says CC BY-NC 4.0 and the release notes say CC BY-NC-SA 4.0. ([DPD docs](https://docs.dpdict.net), [dpd-db release](https://github.com/digitalpalidictionary/dpd-db/releases/tag/v0.4.20260728))

**Decisions**
- The site retells and cites. It never reproduces the *Manual*: no passages and no tables. Every claim points to a chapter and section of the *Manual* (CMA I.3 and so on), or to a sutta.
- Sutta quotations come from Sujato's CC0 translations and are credited anyway ("tr. Bhikkhu Sujato, SuttaCentral").
- Pāli words link out to the DPD and are not copied into the site, so the site's own licence stays free to choose.
- The site's own text and drawings are the atlas's: the owner can license them, and CC BY-SA 4.0 is still the suggestion.

## 2. How Pāli reading sites work

- SuttaCentral puts the DPD inside its reader: switch on "Active Pāli word lookup" and click any Pāli word to see its entry. Its forum notes the gaps: compounds often have no entry, and there is no reverse lookup from English to Pāli. ([DPD on SuttaCentral](https://docs.dpdict.net/sutta_central.html), [missing words thread](https://discourse.suttacentral.net/t/missing-pali-words-lookup-in-mn-137/26517))
- Access to Insight keeps a single long glossary page. ([ATI glossary](https://accesstoinsight.org/glossary.html))

**Decisions**
- Every Pāli term in the text gets the site's own short gloss on hover or tap. These come from the atlas glossary of 223 terms, which was written for this book, so they also cover the compounds.
- Every glossary entry works both ways: search finds the English word or the Pāli, and each entry links to the concept page that explains it.

## 3. Reading layout

- Tufte CSS puts sidenotes and small figures in the right margin on wide screens. ([tufte.css](https://cdnjs.cloudflare.com/ajax/libs/tufte-css/1.4/tufte.css))
- Gwern's survey of sidenote implementations recommends the Tufte approach: static HTML and CSS built at compile time, no script. On narrow screens the margin is gone, so notes have to collapse inline or open as popovers. ([gwern.net/sidenote](https://gwern.net/sidenote))

**Decisions**
- One text column of about 66 characters in Gentium Book Plus, which carries every Pāli diacritic.
- Sidenotes in the right margin from 1100 px up. Below that, each note is a numbered marker that opens the note inline, with no script.
- Figures span the text column. A wide figure may break into the margin.

## 4. Stack

- **Astro** content collections load Markdown and MDX from any folder with the `glob` loader. ([Astro content loader API](https://docs.astro.build/en/reference/content-loader-reference/)) The version installed is 7.4.4.
- **GitHub Pages**: set `site` and `base` (the repository name) in the config, build with `withastro/action`, and deploy with `actions/deploy-pages`. Pages must be set to "GitHub Actions" in the repository settings. ([Astro on GitHub Pages](https://v4.docs.astro.build/en/guides/deploy/github/))
- **Pagefind** builds a static search index after the build, so search does not work in `astro dev`. It runs as a plain postbuild step with `pagefind --site dist`, without the `astro-pagefind` wrapper. ([astro-pagefind](https://github.com/shishkin/astro-pagefind), [notes](https://lilting.ch/en/articles/pagefind-astro-search)) No source said whether it folds diacritics, so this was tested after the build: see below.

**Decision**: Astro, MDX, and Pagefind on GitHub Pages. No server, no database, no account.

## 5. Discussion

- **giscus** stores comments as GitHub Discussions. `data-mapping="specific"` with a fixed term per page keeps a discussion on the concept even if the page is renamed or moved. Strict title matching avoids GitHub's fuzzy search mixing up similar titles such as "Javana" and "Javana and kamma". ([giscus](https://giscus.app/), [tips for giscus](https://brycewray.com/posts/2022/05/tips-using-giscus/))

**Decisions**
- Every concept and reading page ends with "Reflect and discuss": an opening question, a model answer kept closed until the reader opens it, then giscus with `mapping=specific`, `term=<page id>` and `strict=1`.
- giscus is switched off until the owner turns on Discussions and installs the giscus app; it needs the repository and category ids in `src/site.config.mjs`. Until then the section shows the question and the answer, and says that discussion is coming.
- Margin annotation (Hypothesis) waits until people are actually reading; a second discussion system at launch would split readers.

## 6. Where the content comes from

The atlas already holds most of the words:
- 16 ideas, each with a long philosophical description, a picture, its sources in the Canon, and its 30 links to other ideas.
- Stories from the Buddha's life, the Jātakas and the disciples.
- The glossary of 223 terms.
- Seven levels with their questions.

`tools/extract.mjs` renders the atlas once and saves its data, the idea pictures and the plate drawings as JSON, so the site always matches the atlas. Readings are new prose written for the screen, one per plate, in `src/content/readings/`. The first is *The mango and the moment*.
