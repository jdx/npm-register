const user = require('../user')
const config = require('../config')

async function doAuth (req, res, next) {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1]
    req.username = await user.findByToken(token)
  }
  if (!req.username) return res.status(401).end()
  next()
}

module.exports = {
  read: function (req, res, next) {
    if (config.auth.read) {
      doAuth(req, res, next)
    } else {
      next()
    }
  },
  write: function (req, res, next) {
    if (config.auth.write) {
      doAuth(req, res, next)
    } else {
      next()
    }
  },
  always: function (req, res, next) {
    doAuth(req, res, next)
  }
}
