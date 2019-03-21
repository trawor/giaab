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

class Gpost {
  static parse(item) {
    const ret = {
      id: item.id.toString(),
      number: item.number.toString(),
      title: item.title,
      body: item.body,
      created_at: item.created_at,
      updated_at: item.updated_at,
      locked: item.locked,
      comments: item.comments,
      is_public: false,
      type: 'post',
    };

    if (item.labels.length > 0) {
      ret.tags = item.labels.map((item2) => {
        if (item2.name === '@public') {
          ret.is_public = true;
        } else if (item2.name === '@page') {
          ret.type = 'page';
        }

        return {
          name: item2.name,
          color: item2.color,
        };
      }).filter(item2 => !item2.name.match(/^[@|_]/));
    }

    md.render(item.body);
    ret.meta = md.meta;
    ret.permalink = ret.meta.link || ret.meta.permalink || ret.number;
    md.meta = {};

    return ret;
  }

  static get(idOrNumberOrPermalink) {
    let post = db.get('posts').find({
      permalink: idOrNumberOrPermalink,
    }).value();
    if (post) return post;

    post = db.get('posts').find({
      number: idOrNumberOrPermalink,
    }).value();
    if (post) return post;

    post = db.get('posts').find({
      id: idOrNumberOrPermalink,
    }).value();

    return post;
  }
}

module.exports = {
  Gpost,
  db,
  client: githubClient(),
  init,
};
