const express = require('express')
const logger = require('./config/winston')
const cors = require('cors')

const app = express()

// Allowing cross origin resource sharing (CORS)
app.use(cors())

// Logging HTTP requests with Morgan
app.use(require('morgan')('dev', { stream: logger.stream }))

// Mounting requests parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.on('ready', function () { app.isReady = true })

const db = require('./database')
db.init(function () { app.emit('ready') })

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
app.use(require('./middlewares/errorhandler'))

module.exports = {
  app: app,
  db: db
}
