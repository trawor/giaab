const os = require('os');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
app.proxy = true;
app.use(bodyParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  });
}

// 允许跨域
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
  ctx.set('Access-Control-Max-Age', '3600');
  ctx.set('Access-Control-Allow-Headers', 'x-requested-with,Authorization,Content-Type,Accept');
  ctx.set('Access-Control-Allow-Credentials', 'true');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
  }

  await next();
});

// 记录响应时长
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = Date.now() - start;

  ctx.set('X-Response-Node', os.hostname());
  ctx.set('X-Response-Time', `${ms}ms`);
});

// 捕获异常
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

const router = require('./router');

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
