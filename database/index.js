const config = require('../config')
const logger = require('winston')
const mongoose = require('mongoose')

module.exports = {
  connection: mongoose.connection,
  init: function (done) {
    // To prevent deprecation warnings of collection.ensureIndex
    mongoose.set('useCreateIndex', true)

    if (config.env === 'development') {
      mongoose.set('debug', true)
    }

    // Defining models
    require('../models')

    this.connection.on('open', () => logger.info('MongoDB connection opened.'))
    // Handling global errors, might later want to do more than logging
    this.connection.on('error', function (err) { logger.error(err.toString()) })

    mongoose.connect(config.db_uri, { useNewUrlParser: true })
      .then(function () { done() })
  },
  dropDatabase: function () {
    return this.connection.dropDatabase()
  }
}
