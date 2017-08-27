const opbeat = require('./opbeat')

const pjson = require('../package.json')
const config = require('./config')
const middleware = require('./middleware')
const express = require('express')
const app = express()

app.set('title', `npm-register@${pjson.version}`)
if (config.production) app.enable('trust proxy')

app.use(middleware.logger)
app.use(require('compression')())
app.use(express.static('public'))
app.use(opbeat.middleware.express())
app.use(config.urlPrefix, require('./routes'))

module.exports = app
