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

function* isEtagFresh(name, etag) {
  try {
    if (!etag) { return; }
    if (redis.status !== 'ready') { return rediserr(); }
    return etag === (yield redis.get(`${cacheKey(name)}/etag`));
  } catch (err) {
    console.error(err.stack);
  }
}

function updateEtag(name, etag) {
  co(function* () {
    if (redis.status !== 'ready') { return rediserr(); }
    yield redis.setex(`${cacheKey(name)}/etag`, config.cache.packageTTL, etag);
  });
}

function* fetchFromCache (name) {
  try {
    if (redis.status !== 'ready') { return rediserr(); }
    let pkg = yield redis.get(cacheKey(name));
    if (pkg) {
      console.error(`${name} found in cache`);
      return JSON.parse(pkg);
    }
  } catch (err) {
    console.error(err.stack);
  }
}

function updateCache (pkg) {
  co(function* () {
    if (redis.status !== 'ready') { return rediserr(); }
    yield redis.setex(cacheKey(pkg.name), config.cache.packageTTL, JSON.stringify(pkg));
  });
}

function* get(name, etag) {
  try {
    if (yield isEtagFresh(name, etag)) { return 304; }
    let pkg = yield fetchFromCache(name);
    if (pkg) { return pkg; }
    console.error(`fetching ${name} from npm`);
    let res = yield npm({
      uri: '/'+name.replace(/\//, '%2F'),
      json: true,
      gzip: true,
      headers: { 'if-none-match': etag }
    });
    pkg = res[1];
    res = res[0];
    switch (res.statusCode) {
      case 304:
      case 404:
        updateEtag(name, res.headers.etag);
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
