let r = module.exports = require('express').Router()

r.get('/-/version', function (req, res) {
  res.status(200).json({
    version: require('../../package.json').version
  })
})
