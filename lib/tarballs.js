'use strict';

let npm = require('./npm');
let s3  = require('./s3');

function* get (name, filename) {
  let path = `/${name}/-/${filename}`;
  let tarball = yield s3.get(path);
  if (!tarball) {
    console.log(`saving ${path}`);
    tarball = yield npm.getTarball(name, filename);
    yield s3.putStream(tarball, path, {
      'content-length': tarball.headers['content-length'],
      'content-type': tarball.headers['content-type']
    });
    tarball = yield s3.get(path);
  }
  return tarball;
}

exports.get = get;
