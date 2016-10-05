const app = require('./server')

app.listen(app.port, function () {
  console.error(`${app.name} listening on port ${app.port} [${app.env}]`)
})


process.on('SIGINT', function(){
  console.info('Recieved SIGINT, exiting')
  process.exit(0)
})
process.on('SIGTERM', function(){
  console.log('Recieved SIGTERM, exiting')
  process.exit(0)
})
