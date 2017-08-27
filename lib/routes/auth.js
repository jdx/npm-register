const r = module.exports = require('express').Router()
const aw = require('./asyncawait.js')
const user = require('../user')
const bodyParser = require('body-parser')
const middleware = require('../middleware')

// login
r.put('/-/user/:user', bodyParser.json(), aw(async function (req, res) {
  let auth = await user.authenticate(req.body)
  if (auth) {
    res.status(201).json({token: auth})
  } else {
    res.status(401).json({error: 'invalid credentials'})
  }
}))

// whoami
r.get('/-/whoami', middleware.auth.always, (req, res) => {
  res.status(200).json({username: req.username})
})
