const mongoose = require('mongoose')
const Project = mongoose.model('Project')

var ProjectsController = exports = module.exports = {}

ProjectsController.setProjectOnParam = function (req, res, next, value, name) {
  Project.findById(value).exec().then(function (project) {
    if (!project) throw new Error('Not found')
    req.project = project.toObject()
    project.id = project._id
    next()
  }).catch((err) => {
    if (err.name === 'CastError' || err.message === 'Not found') {
      res.status(404).json({ errors: 'Project not found' })
    } else {
      next(err)
    }
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

ProjectsController.getById = function (req, res, next) {
  if (req.user._id.toString() !== req.project.owner.toString()) {
    res.status(403).json({ errors: 'Access denied' })
  } else {
    req.project.id = req.project._id
    res.status(200).json({ project: req.project })
  }
}
