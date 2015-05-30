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
  uplink:     process.env.UPLINK || 'https://registry.npmjs.com',
  port:       process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  timeout:    process.env.TIMEOUT || 5000,
  s3: {
    key:     getenv('AWS_ACCESS_KEY_ID'),
    secret:  getenv('AWS_SECRET_ACCESS_KEY'),
    bucket:  getenv('AWS_S3_BUCKET'),
  }
};
