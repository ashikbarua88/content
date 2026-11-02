import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// On GitHub Pages the site lives under the repository name: SITE_BASE=/content/ (set by the workflow).
export default defineConfig({
  site: process.env.SITE_URL || "https://ashikbarua88.github.io",
  base: process.env.SITE_BASE || "/",
  trailingSlash: "always",
  integrations: [mdx()],
});
