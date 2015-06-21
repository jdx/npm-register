'use strict';

let bluebird = require('bluebird');
let path     = require('path');
let url      = require('url');
let env      = process.env;

function getenv (key) {
  let val = env[key];
  if (!val) {
    throw new Error(key + ' must be set');
  }
  return val;
}

let config = {
  tmp:            path.normalize(__dirname + '/../tmp'),
  port:           env.PORT || 3000,
  production:     env.NODE_ENV === 'production',
  timeout:        env.TIMEOUT || 10000,
  uplink:         url.parse(env.UPLINK || 'https://registry.npmjs.org'),
  redis:          env.REDIS_URL,
  cloudfrontHost: env.CLOUDFRONT_HOST,
  s3: {
    key:     getenv('AWS_ACCESS_KEY_ID'),
    secret:  getenv('AWS_SECRET_ACCESS_KEY'),
    bucket:  getenv('AWS_S3_BUCKET'),
  },
  cache: {
    packageTTL: parseInt(env.CACHE_PACKAGE_TTL) || 60
  }
};

if (!config.production) {
  bluebird.longStackTraces();
}

module.exports = config;
