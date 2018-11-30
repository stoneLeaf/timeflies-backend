const mongoose = require('mongoose')
const Project = mongoose.model('Project')
const User = mongoose.model('User')

var ProjectsController = exports = module.exports = {}

ProjectsController.setProjectOnParam = function (req, res, next, value, name) {
  Project.findById(value).exec().then(function (project) {
    req.project = project
    if (!req.project) next(new Error('Project not found'))
    next()
  }).catch((err) => {
    if (err.name === 'CastError') next(new Error('Project id invalid'))
    else next(err)
  })
}

ProjectsController.create = function (req, res, next) {
  // TODO: owner should be the current logged in user
  User.findOne().exec().then(function (owner) {
    // Fail safe, logged in user should always exists
    if (!owner) throw new Error('Owner not found')
    req.body.owner = owner._id
    new Project(req.body).save().then(function (project) {
      res.status(200).json(project)
    }).catch((err) => { next(err) })
  })
}

ProjectsController.read = function (req, res, next) {
  Project.findById(req.project._id).populate('owner').exec()
    .then(function (project) {
      res.status(200).json(project)
    }).catch((err) => { next(err) })
}
