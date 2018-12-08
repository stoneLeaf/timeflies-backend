const config = require('./config')
const { app } = require('./app')

app.on('ready', function () {
  app.listen(config.port)
})
