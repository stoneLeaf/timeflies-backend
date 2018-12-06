const passport = require('passport')
const config = require('../config')
const jwt = require('jsonwebtoken')

var AuthController = exports = module.exports = {}

// Made sense to put it here instead of attaching it to the model since
// it allow separation of concerns
AuthController.generateTokenForUser = function (user) {
  // TODO: jwt.sign() is synchronous, can it be a problem?
  return jwt.sign({ email: user.profile.email }, config.jwt_secret)
}

// Using a custom callback instead of authenticate() directly as a middleware
// in order to handle success and failure
AuthController.login = function (req, res, next) {
  // Does not support promises
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) return next(err)
    if (!user) {
      // Customized
      return res.status(401).json({ message: 'Bad email/password combination' })
    }
    // Sending JWT token
    // FIXME: why do I have to reference exports and not 'this'?
    //        something about the scope I don't understand
    return res.status(200).json({ token: exports.generateTokenForUser(user) })
  })(req, res, next)
}
