'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
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

function put (file, key, headers) {
  return s3.putFileAsync(file, key, headers);
}

function putStream (stream, key, headers) {
  return s3.putStreamAsync(stream, key, headers);
}

exports.get       = get;
exports.getFile   = getFile;
exports.put       = put;
exports.putStream = putStream;
