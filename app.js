
// Environnement fallback
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const express = require('express')
const logger = require('./config/winston')
const morgan = require('morgan')

const app = express()

// Setting up Morgan with the 'dev' predefined format and Winston's stream
app.use(morgan('dev', { stream: logger.stream }))

// Parsing all requests as JSON, if it is not, a SyntaxError will be raised
// TODO: maybe find a better way to discard non-JSON requests because
//       SyntaxError might be thrown elsewhere for other reasons
app.use(express.json({ type: '*/*' }))

// Mounting routes
app.use(require('./routes'))

// Sending 404 since none of the middlewares responded
app.use(function (req, res, next) {
  res.status(404).json({ message: 'Not found' })
})

// Error handler
app.use(function (err, req, res, next) {
  if (err.name === 'SyntaxError') {
    // Implying it was raised by the req body parser
    res.status(400).json({ message: 'Request body is not valid JSON' })
  } else {
    // Passing it to the default Express error handler
    next(err)
  }
})

var server = app.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + server.address().port)
})
