'use strict';

let htpasswd = require('htpasswd-auth');
let uuid     = require('node-uuid');
let s3       = require('./s3');

function* getCreds () {
  return yield JSON.parse((yield s3.getFile('/auth_tokens')) || '{}');
}

function* createAuthToken(username) {
  let creds = getCreds();
  let token = uuid.v4();
  creds[username] = token;
  yield s3.putBuffer(new Buffer(JSON.stringify(creds)), '/auth_tokens', {
    'Content-Type': 'application/json'
  });
  return token;
}

function* authenticate (user) {
  let creds = (yield s3.getFile('/htpasswd')) || '';
  let auth  = yield htpasswd.authenticate(user.name, user.password, creds);
  if (!auth) { return false; }
  return yield createAuthToken(user.name);
}

function* findByToken (token) {
  let creds = yield getCreds();
  for (let username of Object.keys(creds)) {
    if (creds[username] === token) {
      return username;
    }
  }
}

exports.authenticate = authenticate;
exports.findByToken  = findByToken;
