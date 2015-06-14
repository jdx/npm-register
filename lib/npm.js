'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let https   = require('https');
let request = require('request');
let co      = require('co');
let config  = require('./config');
let redis   = require('./redis');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

let npm = Promise.promisify(request.defaults({
  baseUrl: config.uplink.href,
  timeout: config.timeout
}));

function rediserr () {
  console.error(`cannot connect to redis. state: ${redis.status}`);
}

function cacheKey (name) {
  return `/packages/${name}`;
}

function* fetchFromCache (name) {
  if (redis.status !== 'ready') { return rediserr(); }
  let pkg = yield redis.get(cacheKey(name));
  if (pkg) {
    console.log(`${name} found in cache`);
    return JSON.parse(pkg);
  }
}

function updateCache (pkg) {
  co(function* () {
    if (redis.status !== 'ready') { return rediserr(); }
    return redis.setex(cacheKey(pkg.name), config.cache.npmPackages, JSON.stringify(pkg));
  });
}

function* get(name, etag) {
  try {
    let pkg = yield fetchFromCache(name);
    if (pkg) { return pkg.etag === etag ? 304 : pkg; }
    console.log(`fetching ${name} from npm`);
    let res = yield npm({
      uri: '/'+name,
      json: true,
      gzip: true,
      headers: { 'if-none-match': etag }
    });
    pkg = res[1];
    res = res[0];
    switch (res.statusCode) {
      case 304:
      case 404:
        return res.statusCode;
      case 200:
        pkg.etag = res.headers.etag;
        updateCache(pkg);
        return pkg;
      default:
        throw new Error(pkg);
    }
  } catch (err) {
    console.error(`error downloading ${name}: ${err}`);
    return 404;
  }
}

function getTarball(name, filename) {
  return new Promise(function (fulfill, reject) {
    https.get(`${config.uplink.href}${name}/-/${filename}`, function (res) {
      if (res.statusCode === 404) {
        fulfill();
        return;
      }
      fulfill(res);
    }).on('error', reject);
  });
}

exports.get = get;
exports.getTarball = getTarball;
