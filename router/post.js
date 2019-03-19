const router = require('koa-router')({
  prefix: 'api/post',
});

const model = require('../model/index');
const db = model.db;

module.exports = router;

router.get('/', async (ctx) => {
  const ret = db.get('posts')
    .filter({
      is_public: true,
    })
    .sortBy('created_at')
    //.take(5)
    .value();
  ctx.body = ret;
});
