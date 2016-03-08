'use strict';

let npm    = require('./npm');
let s3     = require('./s3');
let path   = require('path');

function* get (name, filename, sha) {
  let key = `/tarballs/${name}/${filename}/${sha}`;
  let tarball = yield s3.stream(key);

  if (!tarball) {
    console.error(`saving ${key} to s3`);
    tarball = yield npm.getTarball(name, filename + path.extname(sha));
    yield s3.putStreamAsync(tarball, key, {
      'content-length': tarball.headers['content-length'],
      'content-type':   tarball.headers['content-type']
    });
    tarball = yield s3.stream(key);
  }

  if (!tarball) { return; }
  tarball.size = tarball.headers['content-length'];
  return tarball;
}

exports.get = get;
