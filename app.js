
// Environnement fallback
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const express = require('express')
const logger = require('./config/winston')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()

// Setting up Morgan with the 'dev' predefined format and Winston's stream
app.use(morgan('dev', { stream: logger.stream }))

if (process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
} else {
  mongoose.connect('mongodb://localhost:27017/timeflies', { useNewUrlParser: true })
  mongoose.set('debug', true)
}

// To prevent deprecation warning of collection.ensureIndex
mongoose.set('useCreateIndex', true)

var db = mongoose.connection

// Logging open event
db.on('open', () => logger.info('MongoDB connection opened.'))
// Handling global errors, might later want to do more than logging
db.on('error', function (err) { logger.error(err.toString()) })

require('./models/project')
require('./models/record')
require('./models/user')

// Parsing requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
    logger.debug(err.name)
    next(err)
  }
})

var server = app.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + server.address().port)
})
