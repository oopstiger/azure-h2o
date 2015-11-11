'use strict';

const assert = require('assert');
const droplets = require('./lib/droplets');
const Response = require('./lib/response');

var appCount = 0;

function wrapHandler(handler){
  return function*(next){
    let error = null;
    let data = null;
    try {
      data = yield handler.call(this);
      if (data instanceof Error){
        error = data.message;
        data = null;
      }
    }
    catch(err){
      error = err.toString();
    }
    if (error){
      this.body = Response.error(error);
    }
    else {
      this.body = data instanceof Response ? data : Response.ok(data);
    }
  }
}

function* dropletCreate() {
  let config = this.app.config.droplets;
  if (appCount >= config.maxApps){
    return Response.accessDenied('Apps limit reached.');
  }

  let args = this.request.body;
  let appName = args.appName;
  let ownerEmail = args.ownerEmail;

  assert(appName.length <= 64, 'app name too long(max. 64).');
  assert(/^[a-zA-Z][a-zA-Z0-9\-]+$/.test(appName), 'invalid app name.');
  assert(ownerEmail.length <= 64, 'email too long(max. 64).');
  assert(ownerEmail.indexOf('@') > 0, 'invalid owner email.');

  let result = droplets.create(appName, ownerEmail);
  if (!(result instanceof Error)) {
    return {appKey: result};
  }
  return result;
}

function* dropletPut() {
  let appName = this.params.appName;
  let token = this.query.token;
  if (!token || !droplets.authenticate(appName, token)) {
    return new Error('invalid token.');
  }
}

function* dropletGet() {
  let appName = this.params.appName;
  return droplets.get(appName, this.query.key);
}

module.exports = function (app){
  app.router.post('/droplets/create', wrapHandler(dropletCreate));
  app.router.post('/droplets/put/:appName', wrapHandler(dropletPut));
  app.router.get('/droplets/get/:appName', wrapHandler(dropletGet));
};
