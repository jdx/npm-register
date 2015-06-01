'use strict';

/*jshint -W079 */
let Promise = require('bluebird');
let request = require('request');
let config  = require('./config');

let s3 = require('knox').createClient(config.s3);
s3 = Promise.promisifyAll(s3);

let npm = Promise.promisify(request.defaults({
  baseUrl: 'https://registry.npmjs.org',
  timeout: config.timeout
}));

function* get(name) {
  try {
    let res = yield npm({uri: '/'+name, json: true});
    if (res[0].statusCode === 404) {
      return;
    }
    return res[1];
  } catch (err) {
    console.error('error downloading ' + name + '\n' + err);
  }
}

function* getTarball(name, filename) {
  try {
    let res = yield npm({uri: '/'+name+'/-/'+filename});
    if (res[0].statusCode === 404) {
      return;
    }
    return res[1];
  } catch (err) {
    console.error('error downloading ' + name + '\n' + err.stack);
  }
}

exports.get = get;
exports.getTarball = getTarball;
