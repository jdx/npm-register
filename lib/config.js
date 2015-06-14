'use strict';

let bluebird = require('bluebird');
let path     = require('path');
let url      = require('url');

function getenv (key) {
  let val = process.env[key];
  if (!val) {
    throw new Error(key + ' must be set');
  }
  return val;
}

let config = {
  tmp:        path.normalize(__dirname + '/../tmp'),
  port:       process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  timeout:    process.env.TIMEOUT || 10000,
  uplink:     url.parse(process.env.UPLINK || 'https://registry.npmjs.org'),
  s3: {
    key:     getenv('AWS_ACCESS_KEY_ID'),
    secret:  getenv('AWS_SECRET_ACCESS_KEY'),
    bucket:  getenv('AWS_S3_BUCKET'),
  }
};

if (!config.production) {
  bluebird.longStackTraces();
}

module.exports = config;
