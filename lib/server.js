'use strict'

const opbeat = require('./opbeat')

const Koa = require('koa')
const app = new Koa()
const compress = require('koa-compress')
const config = require('./config')
const routes = require('./routes')
const middleware = require('./middleware')

app.name = 'npm-register'
app.port = config.port
app.proxy = config.production
app.context.opbeat = opbeat

app.use(require('./logger'))
app.use(require('koa-timeout')(config.timeout))
app.use(compress())
app.use(middleware.error)
app.use(routes.routes())
app.use(routes.allowedMethods())
app.use(middleware.notfound)

module.exports = app
