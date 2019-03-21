const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  giaab: {
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
    siteTitle: process.env.GIAAB_TITLE || 'Giaab',
    siteSubTitle: process.env.GIAAB_SUBTITLE || 'A Github Issue based blog',
    siteUrl: process.env.GIAAB_URL,
    // TODO: keywords
  },
};

module.exports = config;
