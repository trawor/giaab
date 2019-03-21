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
      is_page: false,
    })
    .sortBy('number')
    // FIXME: page .take(10)
    .value();
  ctx.body = ret;
});

router.get('/:id', async (ctx) => {
  const ret = model.Gpost.get(ctx.params.id);
  if (!ret) {
    ctx.status = 404;
    ctx.body = {};
    return;
  }
  ctx.body = ret;
});

// TODO: support password protect post
