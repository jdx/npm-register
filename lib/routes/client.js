const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const config = require('../config')
const middleware = require('../middleware')

r.get('/-/api/v1/packages', middleware.auth.read, aw(async function (req, res) {
  config.storage.getAllPackageInfo('packages/').then((data) => {
    res.status(200).json(data)
  }).catch(err => {
    if (err.code !== 'ENOENT') throw err
  })
}))
