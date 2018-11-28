
// Environnement fallback
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const express = require('express')
const logger = require('./config/winston')
const morgan = require('morgan')

const app = express()

// Setting up Morgan with the 'dev' predefined format and Winston's stream
app.use(morgan('dev', { stream: logger.stream }))

var server = app.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + server.address().port)
})
