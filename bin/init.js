const model = require('../model/index');
const ipt = require('./import');

async function run() {
  model.init();
  if (!model.db.has('last_sync').value()) {
    await ipt.run();
    console.log('Init Finished!');
  } else {
    console.log('Already Init!');
  }

  // TODO: auto init repo: label webhook ,etc
}

module.exports = {
  run,
};

if (require.main === module) {
  (async () => {
    await run();
  })();
}
