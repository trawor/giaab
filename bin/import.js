const cluster = require('cluster');
const config = require('../config');
const model = require('../model');
const octokit = model.client;
const db = model.db;

async function run() {
  if (cluster.isWorker) return;

  return new Promise((resolve, reject) => {
    octokit.paginate(`GET /repos/${config.giaab.githubRepo}/issues`).then((issues) => {
      // console.log(issues);
      if (issues.length > 0) {
        const {
          user,
        } = issues[0];
        db.set('user', user).write();
        const c = issues.map((item) => {
          return model.parsePost(item);
        });
        db.set('posts', c).write();
        db.set('last_sync', Date.now()).write();
        resolve(c);
      }
    });
  });

}

module.exports = {
  run,
};

if (require.main === module) {
  (async () => {
    await run();
  })();
}