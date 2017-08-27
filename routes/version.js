'use strict'

const r = require('koa-router')()

// npm publish
r.get('/-/version', function * () {
  this.body = {
    version: require('../package.json').version
  }
})

module.exports = r
