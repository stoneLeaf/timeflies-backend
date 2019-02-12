const config = require('./config')
const logger = require('./config/winston')
const { app } = require('./app')

function load () {
  app.listen(config.port, function () {
    logger.info(`Server listening on port ${config.port}.`)
  })
}

if (app.isReady) {
  load()
} else {
  app.on('ready', function () { load() })
}
