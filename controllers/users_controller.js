const mongoose = require('mongoose')
const User = mongoose.model('User')
const AuthController = require('./auth_controller')

var UsersController = exports = module.exports = {}

UsersController.create = function (req, res, next) {
  const allowedBody = {
    password: req.body.password,
    profile: req.body.profile
  }

  new User(allowedBody).save().then(function (user) {
    res.status(200).json({
      profile: user.profile,
      token: AuthController.generateTokenForUser(user)
    })
  }).catch((err) => { next(err) })
}

UsersController.update = function (req, res, next) {
  // To prevent updates outside of public properties
  const allowedBody = {
    profile: req.body.profile
  }
  if (req.body.password) {
    allowedBody.password = req.body.password
  }

  req.user.set(allowedBody).save().then(function (user) {
    res.status(200).json({
      profile: user.profile,
      token: AuthController.generateTokenForUser(user)
    })
  }).catch((err) => { console.error(err); next(err) })
}

UsersController.getProfile = function (req, res, next) {
  res.json({ profile: req.user.profile })
}
