const app = require('./server')
const config = require('./config')

app.listen(config.port, function () {
  console.error(`${app.name} listening on http://localhost:${config.port} [${app.get('env')}]`)
})
