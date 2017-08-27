const opbeat = require('./opbeat')

// app.context.opbeat = opbeat

// app.use(require('koa-timeout')(config.timeout))
// app.use(compress())
// app.use(routes.routes())
// app.use(routes.allowedMethods())
// app.use(middleware.notfound)

const pjson = require('../package.json')
const config = require('./config')
const middleware = require('./middleware')
const express = require('express')
const app = express()

app.set('title', `npm-register@${pjson.version}`)
if (config.production) app.enable('trust proxy')

app.use(middleware.logger)
app.use(express.static('public'))
app.use(opbeat.middleware.express())
app.use(require('./routes'))

module.exports = app
