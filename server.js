'use strict'

const opbeat = require('opbeat').start({active: !!process.env.OPBEAT_APP_ID})

const app = require('koa')()
const compress = require('koa-compress')
const config = require('./config')
const routes = require('./routes')
const middleware = require('./middleware')

app.name = 'npm-register'
app.port = config.port
app.proxy = config.production
app.context.opbeat = opbeat

app.use(require('./logger'))
app.use(require('koa-timeout')(10000))
app.use(compress())
app.use(middleware.error)
app.use(routes.routes())
app.use(routes.allowedMethods())
app.use(middleware.notfound)

module.exports = app
