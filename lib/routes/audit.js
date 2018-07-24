const r = module.exports = require('express').Router()
const npm = require('../npm')
const middleware = require('../middleware')
const aw = require('./asyncawait')
const bodyParser = require('body-parser')

// forward audit requests to upstream
r.post(
  '/-/npm/v1/security/audits',
  middleware.auth.read,
  bodyParser.json({limit: '3mb'}),
  aw(async function (req, res) {
    const response = await npm.post(req.path, req.body)
    res.send(response)
  })
)
