const config = require('./config')
const app = require('./server')

app.listen(config.port, function () {
  console.error(`${app.name} listening on port ${config.port} [${app.get('env')}]`)
})
