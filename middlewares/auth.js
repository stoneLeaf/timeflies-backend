const passport = require('passport')

var auth = exports = module.exports = {}

auth.required = passport.authenticate('jwt', { session: false })
