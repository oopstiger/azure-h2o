'use strict';

const koa = require('koa');

koa.use(function *(){
  this.body = 'hello, Azure!';
});
koa.listen(7000);
