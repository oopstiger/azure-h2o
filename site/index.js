'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (app){
  app.router.get('/favicon.ico', function* (){
    this.redirect(app.config.site.favicon);
  });

  app.router.get('/', function* (){
    this.redirect(app.config.site.homepage);
  });

  // The 404 page
  let page404 = fs.readFileSync(path.join(__dirname, '404.html')).toString('utf8');
  app.use(function *(){
    this.body = page404;
    this.response.set('Content-Type', 'text/html');
  });
};
