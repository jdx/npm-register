'use strict';

let fs     = require('fs');
let path   = require('path');
let co     = require('co');
let npm    = require('./npm');
let s3     = require('./s3');
let config = require('./config');
let util   = require('./util');

function saveToTmp(tmp, key) {
  co(function* () {
    yield util.mkdirp(path.dirname(tmp));
    let tarball = yield s3.stream(key);
    tarball.pipe(fs.createWriteStream(tmp));
  });
}

function getFromTmp (file) {
  return fs.statAsync(file)
  .then(function (stat) {
    let tarball = fs.createReadStream(file);
    tarball.size = stat.size;
    return tarball;
  })
  .catch(function (err) {
    if (err.code !== 'ENOENT') { throw err; }
  });
}

function* download (name, filename, key) {
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

function* get (name, filename) {
  let key = `tarballs/${name}/${filename}`;
  let tmp = config.tmp + '/' + key;

  let tarball = yield getFromTmp(tmp);
  if (tarball) { return tarball; }

  tarball = yield download(name, filename, key);
  if (!tarball) { return; }

  saveToTmp(tmp, key);

  return tarball;
}

exports.get = get;
