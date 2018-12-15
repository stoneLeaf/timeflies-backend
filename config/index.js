// Environnement fallback
// TODO: set NODE_ENV value as well in case of fallback?
let env = process.env.NODE_ENV || 'development'

let commonConfigs = require('./common')
let envConfigs = require(`./${env}`)

module.exports = Object.assign(commonConfigs, envConfigs)
