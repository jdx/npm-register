'use strict';

let htpasswd = require('htpasswd-auth');

function authenticate (user) {
  return htpasswd.authenticate(user.email, user.password);
}

exports.authenticate = authenticate;
