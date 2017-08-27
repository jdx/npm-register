const r = module.exports = require('express').Router()
const aw = require('./asyncawait')
const npm = require('../npm')
const config = require('../config')
const middleware = require('../middleware')
const bodyParser = require('body-parser')

let getPackage = name => config.storage.getJSON(`packages/${name}`)

r.get('/-/package/:name/dist-tags', middleware.auth.read, aw(async function (req, res) {
  let {name} = req.params
  let pkg = await npm.get(name)
  res.set('Cache-Control', 'public, max-age=0') // TODO: cache dist-tags
  if (pkg !== 404) res.status(200).json(pkg['dist-tags'])
  else {
    let pkg = await getPackage(name)
    res.status(200).json(pkg['dist-tags'])
  }
}))

r.put('/-/package/:name/dist-tags/:tag', middleware.auth.write, bodyParser.text({type: '*/*'}), aw(async function (req, res) {
  let {name, tag} = req.params
  let version = JSON.parse(req.body)
  let pkg = await npm.get(name)
  if (pkg !== 404) {
    res.status(400).json({
      error: `Cannot set dist-tags, ${name} is hosted on ${config.uplink.host}`
    })
  }
  pkg = await getPackage(name)
  pkg['dist-tags'] = Object.assign(pkg['dist-tags'], {[tag]: version})
  await config.storage.put(`packages/${name}`, pkg)
  res.status(200).json({})
}))

r.delete('/-/package/:name/dist-tags/:tag', middleware.auth.write, aw(async function (req, res) {
  let {name, tag} = req.params
  let pkg = await npm.get(name)
  if (pkg !== 404) {
    req.status(400).send(`Cannot delete dist-tags, ${name} is hosted on ${config.uplink.host}`)
  }
  pkg = await getPackage(name)
  delete pkg['dist-tags'][tag]
  await config.storage.put(`packages/${name}`, pkg)
  res.status(200).json({})
}))
