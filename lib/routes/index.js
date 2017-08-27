let r = module.exports = require('express').Router()

r.use(require('./ping'))
r.use(require('./version'))
r.use(require('./packages'))
// load('tarballs')
// load('auth')
// load('publish')
// load('dist_tags')
