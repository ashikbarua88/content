// Settings the owner may change.
export const site = {
  title: "Abhidhamma",
  tagline: "Mind, matter and the conditions that join them",
  repo: "https://github.com/ashikbarua88/content/tree/master/abhidhamma",
  // Discussion uses giscus (GitHub Discussions). It stays off until these are filled in:
  // turn on Discussions in the repository, install https://github.com/apps/giscus,
  // then copy the ids that https://giscus.app/ shows for the repository and a category.
  giscus: { repo: "", repoId: "", category: "", categoryId: "" },
};
export const giscusOn = () => Boolean(site.giscus.repoId && site.giscus.categoryId);
