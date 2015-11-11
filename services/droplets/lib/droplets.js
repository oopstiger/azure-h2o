'use strict';

const crypto = require('crypto');
const Authenticator = require('./authenticator');

const APP_KEY_SALT = process.env.APP_KEY_SALT || 'APP_KEY_SALT';


function Droplets(){
  this._droplets = {};
}

Droplets.prototype.create = function (appName, ownerEmail){
  if (this._droplets[appName]){
    return new Error('app name \'' + appName + '\' has been taken.');
  }

  let ts = Date.now();
  let sha1 = crypto.createHash('sha1');
  sha1.update(appName + ts.toString() + APP_KEY_SALT);
  let appKey = sha1.digest('hex');

  this._droplets[appName] = {
    appName: appName,
    appKey: appKey,
    createTime: ts,
    lastRead: ts,
    lastWrite: ts,
    data: {}
  };
  return appKey;
};

Droplets.prototype.authenticate = function (appName, token){
  let appData = this._droplets[appName];
  if (!appData){
    return false;
  }
  let authenticator = new Authenticator(appData.appKey, 30000, 6000);
  return authenticator.authenticate(token);
};

Droplets.prototype.put = function (appName, key, value){
  let appData = this._droplets[appName];
  if (!appData){
    return new Error('app \'' + appName + '\' not found.');
  }

  appData.data[key] = value;
  appData.lastWrite = Date.now();
};

Droplets.prototype.get = function (appName, key){
  let appData = this._droplets[appName];
  if (!appData){
    return new Error('app \'' + appName + '\' not found.');
  }

  appData.lastRead = Date.now();
  return key === null ? appData.data : appData.data[key];
};

var droplets = new Droplets();

module.exports = droplets;
