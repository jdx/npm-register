'use strict';

let Promise = require('bluebird');
let https   = require('https');
let co      = require('co');
let config  = require('./config');
let redis   = require('./redis');
let concat  = require('concat-stream');
let url     = require('url');

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
      console.log(`${name} found in cache`);
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
  if (yield isEtagFresh(name, etag)) { return 304; }
  let pkg = yield fetchFromCache(name);
  if (pkg) { return pkg; }
  console.log(`fetching ${name} from npm`);
  return new Promise((fulfill, reject) => {
    https.request({
      hostname: url.parse(config.uplink.href).hostname,
      port: 443,
      method: 'GET',
      path: `/${name.replace(/\//, '%2F')}`,
      headers: {'if-none-match': etag || 'xxx'},
      timeout: config.timeout,
    }, res => {
      res.setEncoding('utf8');
      res.on('error', reject);
      switch (res.statusCode) {
        case 200:
          res.pipe(concat(pkg => {
            pkg = JSON.parse(pkg);
            pkg.etag = res.headers.etag;
            updateEtag(name, res.headers.etag);
            updateCache(pkg);
            fulfill(pkg);
          }));
          break;
        case 304:
          updateEtag(name, res.headers.etag);
          return fulfill(304);
        default:
          return fulfill(res.statusCode);
      }
    }).end();
  });
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
