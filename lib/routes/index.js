let r = module.exports = require('express').Router()

r.use(require('./ping'))
r.use(require('./version'))

// 'use strict'

// const r = require('koa-router')({ prefix: config.urlPrefix })

// load('packages')
// load('tarballs')
// load('auth')
// load('publish')
// load('dist_tags')
