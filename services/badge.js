"use strict";

const assert = require('assert');
const xcheck = require('xcheck');

let arg = xcheck.createTemplate({
  style: 'travis',
  'foreground': '#fff',
  'head not null': {
    text: '',
    color: '#555',
    width: 0
  },
  'body not null': {
    text: '',
    color: '#007ec6',
    width: 0
  }
});

module.exports = function (app){
  let query = null;

  function response() {
    if (query) {
      this.body = badge(query);
      this.response.type = 'image/svg+xml';
    }
  }

  app.router.get('/badge/:data', function*(next){
    try {
      query = JSON.parse((new Buffer(this.params.data, 'base64')).toString());
      query = arg.validate(query, {applyDefaults:true});
    }
    catch (err){
      return;
    }
    response.call(this);
  });

  app.router.post('/badge', function*(next){
    try {
      query = arg.validate(this.request.body, {applyDefaults:true});
    }
    catch (err){
      return;
    }
    response.call(this);
  });

  app.router.get('/badge', function*(next){
    let q = this.query;
    query = {
      style: q.style || 'travis',
      foreground: q.fc ? ('#' + q.fc) : '#fff',
      head: {
        text: q.h || '',
        color: q.hc ? ('#' + q.hc) : '#555',
        width: q.hw || 0
      },
      body: {
        text: q.b || '',
        color: q.bc ? ('#' + q.bc) : '#007ec6',
        width: q.bw || 0
      }
    };
    response.call(this);
  });
};

function badge(query){
  let head = query.head;
  let body = query.body;
  const CHAR_AVG_WIDTH = 7.5;
  let a = query.body.width ? query.head.width : 8 + head.text.length * CHAR_AVG_WIDTH;
  let b = query.body.width ? query.body.width : 8 + body.text.length * CHAR_AVG_WIDTH;
  let width = a + b;

  if (query.style === 'travis'){
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20"><linearGradient id="a" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><rect rx="3" width="${width}" height="20" fill="${head.color}"/><rect rx="3" x="${a}" width="${b}" height="20" fill="${body.color}"/><path fill="${body.color}" d="M${a} 0h4v20h-4z"/><rect rx="3" width="${width}" height="20" fill="url(#a)"/><g fill="${query.foreground}" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11"><text x="${a/2}" y="15" fill="#010101" fill-opacity=".3">${head.text}</text><text x="${a/2}" y="14">${head.text}</text><text x="${a+b/2}" y="15" fill="#010101" fill-opacity=".3">${body.text}</text><text x="${a+b/2}" y="14">${body.text}</text></g><div/></svg>`;
  }

  // flat style
  let rectHead = 'M0 0h' + a + 'v20H0z';
  let rectBody = 'M' + a + ' 0H' + width + 'v20H' + a + 'z';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20"><g shape-rendering="crispEdges"><path fill="${head.color}" d="${rectHead}"/><path fill="${body.color}" d="${rectBody}"/></g><g fill="${query.foreground}" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11"><text x="${a/2}" y="14">${head.text}</text><text x="${a+b/2}" y="14">${body.text}</text></g><div/></svg>`;
}
