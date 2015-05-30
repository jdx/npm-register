'use strict';

let Promise = require('bluebird');
let axios   = require('axios');
let config  = require('./config');
let path    = require('path');

let s3 = require('knox').createClient({
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: config.s3.bucket
});
s3.getFile = Promise.promisify(s3.getFile);

function saveToS3 (pkg) {
  return new Promise(function (fulfill, reject) {
    console.log('saving', pkg.name);
    let file = path.join(config.tmp, pkg.name);
    fs.writeFile(file, function (err) {
      if (err) { return reject(err); }
      let upload = s3.uploadFile({
        Bucket: config.s3.bucket,
        Key: '/' + pkg.name,
        localFile: file
      });
      upload.on('error', reject);
      upload.on('end', fulfill);
    });
  });
}

function* getFromS3(name) {
  try {
    let file = yield s3.getFile('/' + name);
    console.dir(file);
    return JSON.parse(file);
  } catch (err) {
    console.error(err);
  }
}

function* getFromNpm(name) {
  try {
    let resp = yield axios.get(config.uplink + '/' + name);
    return resp.data;
  } catch (err) {
    if (err.status === 404) {
      return;
    }
    console.error('[npm] error fetching', name);
    console.error(err.data);
  }
}

exports.get = function* get (name) {
  let pkg = yield {
    npm: getFromNpm(name),
    s3:  getFromS3(name)
  };
  if (!pkg.s3 || pkg.npm._rev !== pkg.s3._rev) {
    yield saveToS3(pkg.npm);
  }
  return pkg.npm;
};
