const passport = require('passport')
const config = require('../config')
const jwt = require('jsonwebtoken')

var AuthController = exports = module.exports = {}

// Made sense to put it here instead of attaching it to the model since
// it allow separation of concerns
AuthController.generateTokenForUser = function (user) {
  // TODO: jwt.sign() is synchronous, can it be a problem?
  let expiration = (new Date().getTime() / 1000) + config.jwt_duration
  return jwt.sign({
    email: user.profile.email,
    exp: expiration
  }, config.jwt_secret)
}

// Using a custom callback instead of authenticate() directly as a middleware
// in order to handle success and failure
AuthController.login = function (req, res, next) {
  // Does not support promises
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) return next(err)
    // TODO: this message is unfortunately hard-coded in passport-local
    if (info && info.message === 'Missing credentials') {
      return res.status(422).json({ errors: 'An email and a password is required' })
    }
    if (!user) {
      // Customized
      return res.status(401).json({ errors: 'Bad email/password combination' })
    }
    // Sending JWT token
    return res.status(200).json({
      profile: user.profile,
      token: AuthController.generateTokenForUser(user) })
  })(req, res, next)
}
