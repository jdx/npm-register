'use strict';

function* authenticate (user) {
  if (user.name === 'dickeyxxx') {
    // TODO: check password against htpasswd in s3
    return {token: 'foobar'};
  }
  return;
}

exports.authenticate = authenticate;
