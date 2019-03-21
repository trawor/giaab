const router = require('koa-router')({
  prefix: 'api/webhook',
});
const model = require('../model/index');

const db = model.db;

module.exports = router;

router.post('/github', async (ctx) => {
  const {
    body,
  } = ctx.request;
  const post = body.issue;

  switch (ctx.headers['x-github-event']) {
    case 'issue':
      if (body.action === 'opened') {
        db.get('posts')
          .push(model.parsePost(post)).write();
      } else if (body.action === 'edited') {
        db.get('posts')
          .find({
            id: post.id,
          })
          .assign(model.parsePost(post))
          .write();
      }
      break;
    case 'issue_comment':
      console.log(`New Comment for ${post.id}[${post.number}]-- ${post.title}:`);
      console.log(`${body.comment.id}\n${body.comment.body}`);

      break;

    default:
      console.log(`Ignore Event: ${ctx.headers['x-github-event']}`);
      console.log(ctx.headers, ctx.request.body);
      break;
  }


  ctx.body = {
    msg: 'ok',
  };
});
