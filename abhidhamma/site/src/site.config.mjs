// Settings the owner may change.
export const site = {
  title: "Abhidhamma",
  tagline: "Mind, matter and the conditions that join them",
  repo: "https://github.com/ashikbarua88/content/tree/master/abhidhamma",
};

// Accounts, discussion and synced reflections use Supabase. Put the project's URL and anon key
// in .env (see .env.example and supabase/README.md). Without them the site still works:
// reflections are kept in the reader's browser and discussion says it is not connected yet.
export const supabase = {
  url: import.meta.env.PUBLIC_SUPABASE_URL || "",
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "",
};
