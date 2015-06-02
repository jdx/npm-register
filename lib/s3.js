'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let path    = require('path');
let fs      = Promise.promisifyAll(require('fs'));
let config  = require('./config');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

function concat (stream) {
  return new Promise(function (fulfill, reject) {
    let strings = [];
    stream.setEncoding('utf8');
    stream.on('error', reject);
    stream.on('data', function (data) {
      strings.push(data);
    });
    stream.on('end', function () {
      fulfill(strings.join(''));
    });
  });
}

function* get (key) {
  let res = yield s3.getFileAsync(key);
  if (res.statusCode === 404) {
    return;
  }
  if (res.statusCode !== 200) {
    let err = yield concat(res);
    throw new Error('Error downloading ' + key + '\n' + err);
  }
  return res;
}

function* getFile (key) {
  let res = yield get(key);
  if (!res) { return; }
  return yield concat(res);
}

function* put (pkg) {
  console.log('saving', pkg.name);
  let file = path.join(config.tmp, pkg.name);
  yield fs.writeFileAsync(file, JSON.stringify(pkg));
  yield s3.putFileAsync(file, '/'+pkg.name, {
    'Content-Type': 'application/json'
  });
}

exports.get     = get;
exports.getFile = getFile;
exports.put     = put;
