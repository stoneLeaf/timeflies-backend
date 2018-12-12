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
  req.body.owner = req.user._id
  new Project(req.body).save().then(function (project) {
    // mongoose documents don't allow property modifications
    // TODO: make instead a filter transforming the doc into a public object
    //       with only chosen properties
    project = project.toObject()
    project.id = project._id
    // TODO: the URI should not be hard-coded
    res.status(201).set('location', `/api/projects/${project.id}`)
      .json({ project: project })
  }).catch((err) => { next(err) })
}

ProjectsController.read = function (req, res, next) {
  Project.findById(req.project._id).populate('owner').exec()
    .then(function (project) {
      res.status(200).json(project)
    }).catch((err) => { next(err) })
}
