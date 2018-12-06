// Environnement fallback
// TODO: set NODE_ENV value as well in case of fallback?
var env = process.env.NODE_ENV || 'development'

module.exports = require(`./${env}`)
