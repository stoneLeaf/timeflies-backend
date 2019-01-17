const winston = require('winston')

var ErrorHandler = function (err, req, res, next) {
  if (err.name === 'SyntaxError') {
    // Implying it was raised by the req body parser
    res.status(400).json({ message: 'Request body is not valid JSON' })
  } else if (err.name === 'ValidationError') {
    res.status(422).json({
      errors: ['Validation error', err.message]
    })
  } else {
    // Passing it to the default Express error handler
    winston.error('', err)
    next(err)
  }
}

module.exports = ErrorHandler
