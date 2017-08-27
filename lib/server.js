// const opbeat = require('./opbeat')

// app.context.opbeat = opbeat

// app.use(require('koa-timeout')(config.timeout))
// app.use(compress())
// app.use(middleware.error)
// app.use(routes.routes())
// app.use(routes.allowedMethods())
// app.use(middleware.notfound)

const pjson = require('../package.json')
const config = require('./config')
const express = require('express')
const app = express()

app.set('title', `npm-register@${pjson.version}`)
if (config.production) app.enable('trust proxy')

app.use(require('./logger'))
app.use(express.static('public'))
app.use(require('./routes'))

module.exports = app
