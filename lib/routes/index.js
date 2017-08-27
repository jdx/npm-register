let r = module.exports = require('express').Router()

r.use(require('./ping'))
r.use(require('./version'))
r.use(require('./auth'))
r.use(require('./dist_tags'))
r.use(require('./tarballs'))
r.use(require('./packages'))
r.use(require('./publish'))
