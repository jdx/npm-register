'use strict';

let bluebird = require('bluebird');
let exec = bluebird.promisify(require('child_process').exec);
let expect = require('chai').expect;

process.env.PORT = '7129';
require('../server');
let registry = 'http://localhost:' + process.env.PORT;

process.env.NPM_CONFIG_LOGSTREAM = '/dev/null';

describe('install', function () {
  it('can install heroku-git', function () {
    return exec('npm uninstall heroku-git')
    .then(function () {
      return exec(`npm install heroku-git --registry ${registry}`);
    })
    .then(function (output) {
      let stdout = output[0];
      expect(stdout).to.match(/^heroku-git/);
    })
    .finally(function () {
      exec('npm uninstall heroku-git');
    });
  });
});
