"use strict";

const assert = require('assert');
const xcheck = require('xcheck');

let arg = xcheck.createTemplate({
  style: 'travis',
  foreground: '#ffffff',
  head: '',
  'head-color': '#555555',
  'head-width': 0,
  body: '',
  'body-color': '#7cbb00',
  'body-width': 0
});

function htmlEscape(text){
  return text
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;');
}

function calculateTextWidth(text){
  const CHAR_AVG_WIDTH = 7.5;
  let chars = 0;
  for (let i = 0, n = text.length; i < n; ++i){
    if (text.charCodeAt(i) > 255){
      chars += 1;
    }
    chars += 1;
  }
  return CHAR_AVG_WIDTH * chars;
}

function normalizedColor(color){
  return (color && color[0] !== '#') ? '#' + color : color;
}

function normalizeWidth(width){
  return width ? parseFloat(width) : 0;
}

function* handleQuery(ctx, query){
  try {
    query['head-width'] = normalizeWidth(query['head-width']);
    query['body-width'] = normalizeWidth(query['body-width']);

    query = arg.validate(query, {applyDefaults:true});

    ctx.body = renderBadgeImage(query);
    ctx.response.type = 'image/svg+xml';
  }
  catch (err){
    ctx.body = 'Bad Request.';
    ctx.status = 400;
  }
}

function renderBadgeImage(query){
  let headWidth = query['head-width'];
  headWidth = headWidth || 8 + calculateTextWidth(query.head);
  let bodyWidth = query['body-width'];
  bodyWidth = bodyWidth || 8 + calculateTextWidth(query.body);
  let width = headWidth + bodyWidth;

  let headText = htmlEscape(query.head);
  let bodyText = htmlEscape(query.body);
  let fontColor = normalizedColor(query.foreground) || '#ffffff';
  let headColor = normalizedColor(query['head-color']) || '#555555';
  let bodyColor = normalizedColor(query['body-color']) || '#7cbb00';

  if (query.style === 'flat'){
    // flat style
    let rectHead = 'M0 0h' + headWidth + 'v20H0z';
    let rectBody = 'M' + headWidth + ' 0H' + width + 'v20H' + headWidth + 'z';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20"><g shape-rendering="crispEdges"><path fill="${headColor}" d="${rectHead}"/><path fill="${bodyColor}" d="${rectBody}"/></g><g fill="${fontColor}" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11"><text x="${headWidth / 2}" y="14">${headText}</text><text x="${headWidth + bodyWidth / 2}" y="14">${bodyText}</text></g><div/></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20"><linearGradient id="a" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><rect rx="3" width="${width}" height="20" fill="${headColor}"/><rect rx="3" x="${headWidth}" width="${bodyWidth}" height="20" fill="${bodyColor}"/><path fill="${bodyColor}" d="M${headWidth} 0h4v20h-4z"/><rect rx="3" width="${width}" height="20" fill="url(#a)"/><g fill="${fontColor}" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11"><text x="${headWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${headText}</text><text x="${headWidth / 2}" y="14">${headText}</text><text x="${headWidth + bodyWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${bodyText}</text><text x="${headWidth + bodyWidth / 2}" y="14">${bodyText}</text></g><div/></svg>`;
}

exports.renderBadgeImage = renderBadgeImage;
exports.handleQuery = handleQuery;
