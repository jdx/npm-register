let r = module.exports = require('express').Router()

r.use(require('./ping'))
r.use(require('./version'))
r.use(require('./auth'))
r.use(require('./packages'))
// load('tarballs')
// load('publish')
// load('dist_tags')
