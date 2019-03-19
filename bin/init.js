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
}

module.exports = {
  run,
};

if (require.main === module) {
  (async () => {
    await run();
  })();
}
