const router = require('koa-router')({
  prefix: 'api/webhook',
});
const model = require('../model/index');

const db = model.db;

module.exports = router;

router.post('/github', async (ctx) => {
  // FIXME: check body sign https://developer.github.com/webhooks/securing/
  const {
    body,
  } = ctx.request;
  const ret = {};
  switch (ctx.headers['x-github-event']) {
    case 'issues':
      // eslint-disable-next-line no-case-declarations
      const post = model.Gpost.parse(body.issue);
      console.log(`Issue ${body.action}`);
      if (post.is_public) {
        if (body.action === 'opened') {
          console.log('new post');

          db.get('posts')
            .push(model.Gpost.parse(post)).write();
          ret.msg = 'new post';
        } else if (body.action === 'edited' || body.action === 'labeled') {
          console.log('Post update');
          db.get('posts')
            .find({
              id: post.id,
            })
            .assign(model.Gpost.parse(post))
            .write();
          ret.msg = 'update post';
        }
      } else {
        db.get('posts').remove({
          id: post.id,
        }).write();
        ret.msg = 'remove post';
      }

      break;
    case 'issue_comment':
    default:
      console.log(`Ignore Event: ${ctx.headers['x-github-event']}`);
      console.log(ctx.headers, ctx.request.body);
      ret.msg = 'ignored';
      break;
  }


  ctx.body = ret;
});
