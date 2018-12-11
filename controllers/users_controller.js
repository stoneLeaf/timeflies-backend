const mongoose = require('mongoose')
const User = mongoose.model('User')
const AuthController = require('./auth_controller')

var UsersController = exports = module.exports = {}

UsersController.create = function (req, res, next) {
  // TODO: Remapping, not very clean?
  req.body.profile = {
    email: req.body.email
  }
  new User(req.body).save().then(function (user) {
    res.status(200).json({
      profile: user.profile,
      token: AuthController.generateTokenForUser(user)
    })
  }).catch((err) => { next(err) })
}

UsersController.getProfile = function (req, res, next) {
  res.json({ profile: req.user.profile })
}
