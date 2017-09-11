const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const config = require('../config')
const middleware = require('../middleware')

let getPackage = name => config.storage.getJSON(`packages/${name}`)

r.get('/-/api/v1/packages/:name', middleware.auth.read, aw(async function (req, res) {
  let {name} = req.params
  let pkg = await getPackage(name)
  res.status(200).json(pkg)
}))

r.get('/-/api/v1/packages', middleware.auth.read, aw(async function (req, res) {
  config.storage.get('packages/').then((pkg) => {
    res.status(200).json({ pkg })
  })
}))
