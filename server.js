'use strict';

const fs = require('fs');
const path = require('path');

let app = require('koa')();
let router = require('koa-router')();
let bodyParser = require('koa-body-parser')();

let port = process.env.PORT || 1337;


function *trace(next) {
  let method = this.request.method;
  let url = this.request.url;
  let rt = Date.now();
  yield next;
  rt = Date.now() - rt;
  let status = this.response.status;

  if (status === 200) {
    app.tracing.info('[' + rt + 'ms]' + status + ' ' + method + ' ' + url);
  }
  else {
    if (!status) {
      status = 404; // not handled
    }
    app.tracing.error('[' + rt + 'ms]' + status + ' ' + method + ' ' + url);
  }
}

function startup(){
  app.logging = console;
  app.tracing = console;
  app.router = router;
  app.use(trace);

  fs.readdirSync('./services').forEach(function (script){
    if (script.startsWith('.') || !script.endsWith('.js')){
      return;
    }
    let mod = require('./services/' + script);
    mod(app);
  });

  app.use(router.routes())
      .use(router.allowedMethods())
      .use(bodyParser);

  app.listen(port);
}

startup();
