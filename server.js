'use strict';

const koa = require('koa');

let app = koa();
let port = process.env.PORT || 1337;

app.use(function *(){
  this.body = {
    message: "ok",
    data: 2728911,
    code: 0
  }
});

app.listen(port);
