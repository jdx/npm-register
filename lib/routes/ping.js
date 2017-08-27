let r = module.exports = require('express').Router()

r.get('/-/ping', function (req, res) {
  res.status(200).json({})
})
