const config = require('./config')
const { app } = require('./app')

function load () {
  app.listen(config.port)
}

if (app.isReady) {
  load()
} else {
  app.on('ready', function () { load() })
}
