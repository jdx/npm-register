'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let config  = require('./config');
let util    = require('./util');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

function* get (key) {
  let res = yield s3.getFileAsync(key);
  if (res.statusCode === 404) {
    return;
  }
  if (res.statusCode !== 200) {
    let err = yield util.concat(res);
    throw new Error('Error downloading ' + key + '\n' + err);
  }
  return res;
}

function* getFile (key) {
  let res = yield get(key);
  if (!res) { return; }
  return yield util.concat(res);
}

function putBuffer (buffer, key, headers) {
  return s3.putBufferAsync(buffer, key, headers);
}

function putStream (stream, key, headers) {
  return s3.putStreamAsync(stream, key, headers);
}

exports.get       = get;
exports.getFile   = getFile;
exports.putBuffer = putBuffer;
exports.putStream = putStream;
