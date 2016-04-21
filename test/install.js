'use strict'
/* global describe it */

require('./server')
let registry = 'http://localhost:' + process.env.PORT
let bluebird = require('bluebird')
let exec = bluebird.promisify(require('child_process').exec)
let expect = require('chai').expect

process.env.NPM_CONFIG_LOGSTREAM = '/dev/null'

describe('install', function () {
  it('installs heroku-git', function () {
    return exec('npm uninstall heroku-git').catch(() => {
    })
      .then(() => exec('npm cache clean heroku-git'))
      .then(() => exec(`npm install heroku-git --parseable --registry ${registry}`))
      .then((output) => expect(output, 'to match', /heroku-git$/m))
      .finally(function () {
        exec('npm uninstall heroku-git')
      })
  })
})
