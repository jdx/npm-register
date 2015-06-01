'use strict';

let npm = require('./npm');
let s3  = require('./s3');

function* get (name, filename) {
  let tarball = yield s3.getTarball(name, filename);
  if (!tarball) {
    tarball = yield npm.getTarball(name, filename);
    yield s3.putTarball(name, filename, tarball);
  }
  return tarball;
}

exports.get = get;
