'use strict'

const opbeat = require('opbeat').start()

const app = require('koa')()
const compress = require('koa-compress')
const config = require('./config')
const routes = require('./routes')
const middleware = require('./middleware')

app.name = 'elephant'
app.port = config.port
app.proxy = config.production
app.context.opbeat = opbeat

app.use(require('./logger'))
app.use(compress())
app.use(middleware.error)
app.use(routes.routes())
app.use(routes.allowedMethods())
app.use(middleware.notfound)

module.exports = app
if (!module.parent) {
  app.listen(app.port, function () {
    console.error(`${app.name} listening on port ${app.port} [${app.env}]`)
  })
}
