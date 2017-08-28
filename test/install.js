require('./server')
const registry = 'http://localhost:' + process.env.PORT
const bluebird = require('bluebird')
const exec = bluebird.promisify(require('child_process').exec)
const expect = require('chai').expect
const config = require('../lib/config')
const tmp = require('tmp')
const fs = require('fs-extra')
const path = require('path')

process.env.NPM_CONFIG_PACKAGE_LOCK = 'false'
process.env.NPM_CONFIG_REGISTRY = registry

let dir
tmp.setGracefulCleanup()
beforeEach(() => {
  dir = process.env.NPM_CONFIG_CACHE = tmp.dirSync().name
  process.chdir(dir)
})
afterEach(() => {
  fs.removeSync(dir)
})

;['fs', 's3'].forEach(storage => {
  describe(storage, () => {
    before(() => {
      let Storage = require('../lib/storage/' + storage)
      config.storage = new Storage()
    })
    describe('install', function () {
      it('installs heroku-git', async function () {
        await exec(`npm install heroku-git`)
        expect(fs.existsSync(path.join(dir, 'node_modules', 'heroku-git', 'package.json'))).to.equal(true)
      })
    })
  })
})
