'use strict';

const badge = require('./badge');
const http = require('http');
const url = require('url');
const xcheck = require('xcheck');

let args = xcheck.createTemplate({
  'url not null': ':string',
  title: '',
  'check-response-time': ':string',
  'check-status': '200'
});

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
  try {
    query = args.validate(query, {applyDefaults: true});
    let parsedURL = url.parse(normalizeURL(query.url));
    if (!query.head){
      query.head = parsedURL.hostname;
    }

    query.body = yield getHostStatus(parsedURL, query);
    ctx.body = renderHealthImage(query);
    ctx.type = 'image/svg+xml';
  }
  catch (err) {
    ctx.body = 'Bad Request: ' + err;
    ctx.status = 400;
  }
}

exports.handleQuery = handleQuery;
