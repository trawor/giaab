const Octokit = require('@octokit/rest');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data/db.json');
const db = low(adapter);

const MarkdownIt = require('markdown-it');
const meta = require('markdown-it-meta');

// Make new instance
const md = new MarkdownIt();
// Add markdown-it-meta
md.use(meta);

const config = require('../config');

function init() {

  db.defaults({
    posts: [],
    comments: [],
    user: {},
  }).write();
}

function githubClient() {
  const clientOpt = {
    auth: `token ${config.giaab.githubToken}`,
    // baseUrl: baseUrl || 'https://api.github.com',
  };
  if (process.env.NODE_ENV === 'development') {
    clientOpt.log = console;
  }
  return new Octokit(clientOpt);
}

function parsePost(item) {
  const {
    id,
    number,
    title,
    body,
    created_at,
    updated_at,
    locked,
    comments,
    labels,
  } = item;
  const ret = {
    id,
    number,
    title,
    body,
    created_at,
    updated_at,
    locked,
    comments,
    tags: labels.map((item2) => {
      return {
        name: item2.name,
        color: item2.color,
      };
    }),
  };

  ret.permalink = ret.number;

  if (labels.length > 0) {
    labels.forEach((element) => {
      if (element.name === '@public') {
        ret.is_public = true;
      } else if (element.name === '@page') {
        ret.is_page = true;
      }
    });
  }

  ret.document = md.render(item.body);
  ret.meta = md.meta;
  md.meta = {};

  return ret;
}


module.exports = {
  db,
  client: githubClient(),
  init,
  parsePost,
};
