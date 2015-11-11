'use strict';

const badge = require('./badge');


function getStatusColor(status){
  switch (status.toLowerCase()){
    case 'live': return '#7cbb00'; // green
    case 'heat': return '#ffbb00'; // yellow
    case 'dead': return '#e53238';  // red

    default: // unknown
      return '#999999';  // light gray
  }
}

function* handleQuery(ctx, query){
  let level = query.level || 'LIVE';

  let imgParams = {
    head: query.title,
    body: level,
    'body-color': getStatusColor(level)
  };
  ctx.body = badge.renderBadgeImage(imgParams);
  ctx.type = 'image/svg+xml';
}

exports.handleQuery = handleQuery;
