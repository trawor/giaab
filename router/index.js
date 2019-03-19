const fs = require('fs');
const router = require('koa-router')();

const pkginfo = require('../package.json');

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    try {
      // eslint-disable-next-line
      const subR = require(`./${file}`);
      router.use('/', subR.routes(), subR.allowedMethods());
    } catch (error) {
      console.error(error);
    }
  }
});

const rmap = {
  server: pkginfo.name,
  version: pkginfo.version,
};
const ra = router.stack.map((i) => {
  const ss = i.methods.filter(item => item !== 'HEAD');
  return `${ss.join('|')} ${i.path}`;
}).filter(item => item !== ' /');
rmap.router = ra;
console.info(`Server Routers:\n${ra.join('\n')}`);

router.get('/api', (ctx) => {
  const ret = rmap;
  ret.ip = ctx.ip;
  ctx.body = ret;
});

module.exports = router;
