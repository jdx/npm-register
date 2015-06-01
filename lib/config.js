'use strict';

let path = require('path');

function getenv (key) {
  let val = process.env[key];
  if (!val) {
    throw new Error(key + ' must be set');
  }
  return val;
}

module.exports = {
  tmp:        path.join(__dirname, '..', 'tmp'),
  port:       process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  timeout:    process.env.TIMEOUT || 5000,
  host:       getenv('HOST'),
  s3: {
    key:     getenv('AWS_ACCESS_KEY_ID'),
    secret:  getenv('AWS_SECRET_ACCESS_KEY'),
    bucket:  getenv('AWS_S3_BUCKET'),
  }
};
