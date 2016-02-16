'use strict';

let htpasswd = require('htpasswd-auth');
let uuid     = require('node-uuid');
let s3       = require('./s3');

function* getCreds () {
  return yield JSON.parse((yield s3.download('auth_tokens')) || '{}');
}

function* createAuthToken(username) {
  let creds = yield getCreds();
  let token = uuid.v4();
  creds[token] = {
    username,
    timestamp: new Date(),
  };
  yield s3.upload({Body: JSON.stringify(creds), Key: 'auth_tokens', ContentType: 'application/json'});
  return token;
}

function* authenticate (user) {
  let creds = (yield s3.download('htpasswd')) || '';
  let auth  = yield htpasswd.authenticate(user.name, user.password, creds);
  if (!auth) { return false; }
  return yield createAuthToken(user.name);
}

function* findByToken (token) {
  let creds = yield getCreds();
  return creds[token].username;
}

exports.authenticate = authenticate;
exports.findByToken  = findByToken;
