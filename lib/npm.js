'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let https   = require('https');
let request = require('request');
let config  = require('./config');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

let npm = Promise.promisify(request.defaults({
  baseUrl: 'https://registry.npmjs.org',
  timeout: config.timeout
}));

function* get(name, etag) {
  try {
    let res = yield npm({
      uri: '/'+name,
      json: true,
      gzip: true,
      headers: { 'if-none-match': etag }
    });
    if (res[0].statusCode === 404) {
      return 404;
    }
    if (res[0].statusCode === 304) {
      return 304;
    }
    res[1].etag = res[0].headers.etag;
    return res[1];
  } catch (err) {
    console.error('error downloading ' + name + '\n' + err);
  }
}

function getTarball(name, filename) {
  return new Promise(function (fulfill, reject) {
    https.get(`https://registry.npmjs.org/${name}/-/${filename}`, function (res) {
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
