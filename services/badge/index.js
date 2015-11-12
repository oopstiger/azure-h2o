'use strict';

const badge = require('./lib/badge');
const health = require('./lib/http-health');


module.exports = function (app) {
  app.router.get('/badge', function*(next){
    yield badge.handleQuery(this, this.query);
  });

  app.router.post('/badge', function*(next){
    yield badge.handleQuery(this, this.request.body);
  });

  app.router.get('/badge/health', function*(next){
    yield health.handleQuery(this, this.query);
  });
};
