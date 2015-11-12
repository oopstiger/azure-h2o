'use strict';

const badge = require('./badge');
const http = require('http');
const url = require('url');
const xcheck = require('xcheck');

let args = xcheck.createTemplate({
  'url not null': ':string',
  'check-response-time': ':string',
  'check-status': '200',
  style: 'travis',
  foreground: '#ffffff',
  head: '',
  'head-color': '#555555',
  'head-width': 0,
  'body-width': 0
});

function FreqWall(){
  this._trace = new Map();
}

FreqWall.prototype.grant = function (hostname){
  let tm = Date.now();
  let lastAccess = this._trace.get(hostname);
  if (lastAccess && tm - lastAccess < 30000){
    return false;
  }
  this._trace.set(hostname, tm);
  return true;
};

FreqWall.prototype.startScan = function (){
  let tm = Date.now();
  let self = this;
  self._trace.forEach(function (v, k){
    if (tm - v >= 30000){
      self._trace.delete(k);
    }
  });

  setTimeout(function(){
    self.startScan();
  }, 15000);
};

function getStatusColor(status) {
  status = status.toUpperCase();
  if (['GOOD', 'OK', 'RUNNING', 'LIVE'].indexOf(status) >= 0) {
    return '#4EBA0F'; // green
  }
  if (['WARN'].indexOf(status) >= 0) {
    return '#ffbb00'; // yellow
  }
  if (['BAD', 'ERROR', 'DOWN', 'DEAD', 'FAIL'].indexOf(status) >= 0) {
    return '#e53238'; // red
  }
  return '#999999';   // light gray
}

function renderHealthImage(options) {
  options['body-color'] = getStatusColor(options.body);
  return badge.renderBadgeImage(options);
}

function normalizeURL(url) {
  let scheme = url.substr(0, 7).toLowerCase();
  return (scheme === 'http://' || scheme === 'https://') ? url : 'http://' + url;
}

function normalizeRT(rt) {
  try {
    return parseFloat(rt && rt.endsWith('ms') ? rt.substr(0, rt.length - 2) : rt);
  }
  catch (err){
    return null;
  }
}

let freqWall = function (){
  let fw = new FreqWall();
  fw.startScan();
  return fw;
}();

function getHostStatus(parsedURL, query) {
  let options = {
    hostname: parsedURL.hostname,
    port: parsedURL.port,
    path: parsedURL.path,
    timeout: query.timeout || 6000
  };

  let checkStatus = (query['check-status'] || 200 ).toString();
  let checkRT = normalizeRT(query['check-response-time']);

  return function (callback) {
    let req = http.request(options, function (res) {
      if (res.statusCode.toString() !== checkStatus) {
        callback(null, 'FAIL');
        return;
      }
      if (checkRT) {
        let rt = normalizeRT(res.headers['x-response-time']);
        if (rt === null){
          callback(null, 'FAIL');
          return;
        }
        if (rt > checkRT) {
          callback(null, 'WARN');
          return;
        }
      }
      callback(null, 'OK');
    });

    req.once('error', function (err) {
      callback(null, 'ERROR');
    });

    req.end();
  };
}

function* handleQuery(ctx, query) {
  if (!freqWall){
    freqWall = new FreqWall();
    freqWall.startScan();
  }

  let app = ctx.app;
  try {
    query = args.validate(query, {applyDefaults: true});
    let parsedURL = url.parse(normalizeURL(query.url));
    if (!query.head){
      query.head = parsedURL.hostname;
    }

    if (!freqWall.grant(parsedURL.hostname)){
      ctx.body = 'Forbidden.';
      ctx.status = 403;
      return;
    }

    app.trace.info('health-check ' + query.url);

    query.body = yield getHostStatus(parsedURL, query);
    ctx.body = renderHealthImage(query);
    ctx.type = 'image/svg+xml';
  }
  catch (err) {
    ctx.body = 'Bad Request.';
    ctx.status = 400;
  }
}

exports.handleQuery = handleQuery;
