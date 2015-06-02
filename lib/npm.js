'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let https   = require('https');
let request = require('request');
let config  = require('./config');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

let npm = Promise.promisify(request.defaults({
  baseUrl: `https://${config.uplink}`,
  timeout: config.timeout
}));

function* get(name, etag) {
  let res = yield npm({
    uri: '/'+name,
    json: true,
    gzip: true,
    headers: { 'if-none-match': etag }
  });
  switch (res[0].statusCode) {
    case 304:
    case 404:
      return res[0].statusCode;
    case 200:
      res[1].etag = res[0].headers.etag;
      return res[1];
    default:
      throw new Error(res[1]);
  }
}

function getTarball(name, filename) {
  return new Promise(function (fulfill, reject) {
    https.get(`https://${config.uplink}/${name}/-/${filename}`, function (res) {
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
