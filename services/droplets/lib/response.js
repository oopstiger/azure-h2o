'use strict';

function Response(code, message, data){
  this.code = code;
  this.message = message;
  this.data = data;
}

Response.ok = function (data){
  return new Response(200, 'OK', data);
};

Response.badRequest = function (message){
  message = message || 'That\'s all we know.';
  return new Response(400, 'Bad Request - ' + message, null);
};

Response.error = Response.badRequest;

Response.accessDenied = function (message){
  message = message || 'God bless you.';
  return new Response(403, 'Access Denied - ' + message, null);
};

Response.notFound = function (message){
  message = message || 'This is not what you are looking for.';
  return new Response(404, 'Not Found - ' + message, null);
};

module.exports = Response;
