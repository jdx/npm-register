const app = require('./server')
const config = require('./config')

app.listen(config.port, function () {
  console.log(`${app.name} listening on port ${config.port} [${app.get('env')}]`)
})
