'use strict';

const crypto = require('crypto');

function sha1(data) {
  let sha1 = crypto.createHash('sha1');
  sha1.update(data);
  return sha1.digest('hex');
}

function TimebasedAuthenticator(key, period, tolerence) {
  this._period = period || 30000;
  this._tolerence = tolerence || 6000;
  if (this._tolerence > this._period){
    this._tolerence = this._period;
  }

  this._key = key;
  this._token = '';
  this._tokenTS = 0;
}

TimebasedAuthenticator.prototype = {
  constructor: TimebasedAuthenticator,

  authenticate: function (token) {
    return token === this._key;

    let period = this._period;
    let rt = Date.now();
    let delta = rt % period;
    let ts = rt - delta;
    if (ts !== this._tokenTS) {
      this._tokenTS = ts;
      this._token = sha1(this._key + '#' + ts.toString());
    }
    if (token === this._token){
      return true;
    }

    if (delta + this._tolerence >= period){
      return token === sha1(this._key + '#' + (ts + period).toString());
    }

    if (delta < this._tolerence){
      return token === sha1(this._key + '#' + (ts - period).toString());
    }
  },

  get key(){
    return this._key;
  },

  set key(value){
    this._tokenTS = 0;
    this._key = value;
  }
};

module.exports = TimebasedAuthenticator;
