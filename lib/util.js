'use strict';

/*jshint -W079 */
let Promise = require('bluebird');

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

exports.concat = concat;
