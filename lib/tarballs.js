'use strict';

let npm = require('./npm');
let s3  = require('./s3');

function* get (name, filename) {
  let key = `tarballs/${name}/${filename}`;
  let tarball = yield s3.stream(key);

  if (!tarball) {
    console.log(`saving ${key} to s3`);
    tarball = yield npm.getTarball(name, filename);
    yield s3.upload({
      Body: tarball,
      Key: key,
      ContentLength: tarball.headers['content-length'],
      ContentType:   tarball.headers['content-type']
    });
    tarball = yield s3.stream(key);
  }

  if (!tarball) return;
  tarball.size = tarball.headers['content-length'];
  return tarball;
}

exports.get = get;
