'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let path    = require('path');
let fs      = Promise.promisifyAll(require('fs'));
let concat  = require('concat-stream');
let config  = require('./config');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

function get (name) {
  return new Promise(function (fulfill, reject) {
    let key = '/' + name;
    s3.getFile(key, function (err, res) {
      if (err) { return reject(err); }
      if (res.statusCode === 404) {
        fulfill();
        return;
      }
      res.setEncoding('utf8');
      res.pipe(concat(function (body) {
        if (res.statusCode === 200) {
          fulfill(JSON.parse(body));
        } else {
          reject(new Error('Error downloading ' + key + '\n' + body));
        }
      }));
    });
  });
}

function* put (pkg) {
  console.log('saving', pkg.name);
  let file = path.join(config.tmp, pkg.name);
  yield fs.writeFileAsync(file, JSON.stringify(pkg));
  yield s3.putFileAsync(file, '/'+pkg.name, {
    'Content-Type': 'application/json'
  });
}

exports.get = get;
exports.put = put;
