'use strict';

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

let app = require('koa')();
let router = require('koa-router')();
let bodyParser = require('koa-body-parser')();

let port = process.env.PORT || 1337;


function *traceRT(next) {
  let method = this.request.method;
  let url = this.request.url;
  let rt = Date.now();
  yield next;
  rt = Date.now() - rt;
  let status = this.response.status;

  if (!status) {
    status = 404; // not handled
  }
  app.trace.info('[' + rt + 'ms] ' + status + ' ' + method + ' ' + url);
}

function setupLogging(){
  if (!fs.existsSync('./log')){
    fs.mkdirSync('./log');
  }
  app.config = require('./config.json');
  log4js.configure(app.config.log4js);

  app.logging = log4js.getLogger('app');
  app.trace = log4js.getLogger('trace');
}

function startup(){
  setupLogging();

  app.router = router;
  app.use(traceRT);
  app.use(bodyParser);

  app.logging.info('bring up services...');
  fs.readdirSync('./services').forEach(function (moduleName){
    if (moduleName.startsWith('.')){
      return;
    }
    try {
      require('./services/' + moduleName)(app);
    }
    catch (err){
      app.logging.error('module [' + moduleName + '] fail to load:', err);
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.logging.info('bring up site basics...');
  require('./site')(app);

  app.listen(port);
  app.logging.info('azure-h2o is up and running now.\n\n');
}

startup();
