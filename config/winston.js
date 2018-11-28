const logger = require('winston')

// Configuring the default Winston logger, that way any module can just
// require the winston module directly to get the same instance
logger.configure({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
  format: logger.format.combine(
    logger.format.colorize(),
    logger.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    logger.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new logger.transports.Console()
  ] })

// Adding a stream function usable by other middlewares like Morgan
logger.stream = {
  write: function (str) {
    logger.info(str)
  }
}

module.exports = logger
