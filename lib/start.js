const app = require('./server')

app.listen(app.port, function () {
  console.error(`${app.name} listening on port ${app.port} [${app.env}]`)
})
