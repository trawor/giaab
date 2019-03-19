const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  giaab: {
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
  },
};

module.exports = config;
