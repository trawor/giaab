/* eslint-disable no-console */
const cluster = require('cluster');
const os = require('os');
const init = require('./bin/init');

const ENV = process.env.NODE_ENV === 'production' ? 'P' : 'D';

(() => {
  const logHead = `${ENV} ${process.pid}`;
  const logPrefix = `\x1b[7m${logHead}\x1b[0m`;
  const infoPrefix = `\x1b[44m${logHead}\x1b[0m`;
  const errPrefix = `\x1b[41m\x1b[30m${logHead}\x1b[0m`;

  const {
    log,
    info,
    error,
  } = console;

  console.log = function ov() {
    // eslint-disable-next-line prefer-rest-params
    const copyArgs = Array.prototype.slice.call(arguments);
    copyArgs.unshift(logPrefix);

    log(...copyArgs);
  };
  console.info = function ov() {
    // eslint-disable-next-line prefer-rest-params
    const copyArgs = Array.prototype.slice.call(arguments);
    copyArgs.unshift(infoPrefix);

    info(...copyArgs);
  };
  console.error = function ov() {
    // eslint-disable-next-line prefer-rest-params
    const copyArgs = Array.prototype.slice.call(arguments);
    copyArgs.unshift(errPrefix);

    error(...copyArgs);
  };
})();


/** ********************************************* */


const app = require('./app');
const config = require('./config');

const defaultPort = parseInt(config.port, 10);

async function startHTTP(port) {
  const listenPort = port || defaultPort;

  if (app.server) return app.server;
  const ret = await app.listen(listenPort);
  app.server = ret;
  console.info(`HTTP Server Start on Port: ${listenPort}`);
  return ret;
}

async function start() {
  if (cluster.isMaster) {
    await init.run();
  }
  await startHTTP();
  // 启动其它服务


  // 注册全局未捕获异常处理器
  process.on('uncaughtException', (err) => {
    console.error('Caught exception:', err.stack, err);
  });
  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
  });
}

/** ********************************************* */

// 进程数量建议设置为可用的 CPU 数量

if (ENV !== 'P') {
  (async () => {
    await start();
  })();
} else {
  const workers = os.cpus().length || 1;

  if (cluster.isMaster) {
    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.error(`worker died, restarting in 2 sec...\n code:${code}, signal: ${signal}`);
      setTimeout(() => {
        cluster.fork();
      }, 2000);
    });
  } else {
    (async () => {
      await start();
    })();
  }
}
