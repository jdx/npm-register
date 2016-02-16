'use strict';

require('./server');
let registry = 'http://localhost:' + process.env.PORT;
let bluebird = require('bluebird');
let exec = bluebird.promisify(require('child_process').exec);
let expect = require('chai').expect;

process.env.NPM_CONFIG_LOGSTREAM = '/dev/null';

describe('install', function () {
  it('can install heroku-git', function () {
    this.timeout(20000);
    return exec('npm uninstall heroku-git').catch(() => {})
    .then(() => exec(`npm install heroku-git --registry ${registry}`))
    .then(() => exec(`npm ls --parseable`))
    .then(output => expect(output).to.match(/heroku-git$/m))
    .finally(function () {
      exec('npm uninstall heroku-git').catch(() => {});
    });
  });
});
