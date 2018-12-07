const express = require('express')
const config = require('./config')
const logger = require('./config/winston')
const mongoose = require('mongoose')

const app = express()

// To prevent deprecation warning of collection.ensureIndex
mongoose.set('useCreateIndex', true)

if (config.env === 'development') {
  mongoose.set('debug', true)

  // Logging HTTP requests with Morgan
  app.use(require('morgan')('dev', { stream: logger.stream }))
}

mongoose.connect(config.db_uri, { useNewUrlParser: true })

var db = mongoose.connection

db.on('open', () => logger.info('MongoDB connection opened.'))
// Handling global errors, might later want to do more than logging
db.on('error', function (err) { logger.error(err.toString()) })

// Defining models
require('./models')

// Mounting requests parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initializing passport
const passport = require('passport')
require('./config/passport')
app.use(passport.initialize())

// Mounting routes
app.use(require('./routes'))

// Sending 404 when none of the middlewares responded
app.use(function (req, res, next) {
  res.status(404).json({ message: 'Not found' })
})

// Error handler
app.use(function (err, req, res, next) {
  if (err.name === 'SyntaxError') {
    // Implying it was raised by the req body parser
    res.status(400).json({ message: 'Request body is not valid JSON' })
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ message: 'Validation error', error: err.message })
  } else {
    // Passing it to the default Express error handler
    next(err)
  }
})

module.exports = {
  app: app,
  db: db
}
