const mongoose = require('mongoose')
const User = mongoose.model('User')

var UsersController = exports = module.exports = {}

UsersController.create = function (req, res, next) {
  new User(req.body).save().then(function (user) {
    res.status(200).json(user)
  }).catch((err) => { next(err) })
}
