'use strict'
/* global describe it before */

require('./server')
let registry = 'http://localhost:' + process.env.PORT
let bluebird = require('bluebird')
let exec = bluebird.promisify(require('child_process').exec)
let expect = require('unexpected')
let config = require('../config')

process.env.NPM_CONFIG_LOGSTREAM = '/dev/null';

['fs', 's3'].forEach(storage => {
  describe(storage, () => {
    before(() => {
      let Storage = require('../lib/storage/' + storage)
      config.storage = new Storage()
    })
    describe('install', function () {
      it('installs heroku-git', function () {
        return exec('npm uninstall heroku-git').catch(() => {})
        .then(() => exec('npm cache clean heroku-git'))
        .then(() => exec(`npm install heroku-git --parseable --registry ${registry}`))
        .then((output) => expect(output, 'to match', /heroku-git$/m))
        .finally(function () {
          exec('npm uninstall heroku-git')
        })
      })
    })
  })
})
