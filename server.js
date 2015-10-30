'use strict';

const koa = require('koa');
const bodyParser = require('koa-body-parser');

let app = koa();
app.use(bodyParser());

let port = process.env.PORT || 1337;

app.use(function *(){
  this.body = process.env;
});

app.listen(port);
