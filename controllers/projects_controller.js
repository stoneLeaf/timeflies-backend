const mongoose = require('mongoose')
const Project = mongoose.model('Project')

var ProjectsController = exports = module.exports = {}

ProjectsController.setProjectOnParam = function (req, res, next, value, name) {
  Project.findById(value).exec().then(function (project) {
    if (!project) throw new Error('Not found')
    req.project = project
    next()
  }).catch((err) => {
    if (err.name === 'CastError' || err.message === 'Not found') {
      res.status(404).json({ errors: 'Project not found' })
    } else {
      next(err)
    }
  })
}

ProjectsController.onlyAllowOwner = function (req, res, next) {
  if (req.user._id.toString() !== req.project.owner.toString()) {
    res.status(403).json({ errors: 'Access denied' })
  } else {
    next()
  }
}

ProjectsController.create = function (req, res, next) {
  req.body.owner = req.user._id
  new Project(req.body).save().then(function (project) {
    // TODO: the URI should not be hard-coded
    res.status(201).set('location', `/api/projects/${project.id}`)
      .json({ project: project.publicJSON() })
  }).catch((err) => { next(err) })
}

ProjectsController.getById = [ProjectsController.onlyAllowOwner, function (req, res, next) {
  res.status(200).json({ project: req.project.publicJSON() })
}]

ProjectsController.getAll = function (req, res, next) {
  Project.find({ owner: req.user._id }).exec().then(function (arr) {
    let projects = arr.map(project => {
      return project.publicJSON()
    })
    res.status(200).json({ projects: projects })
  }).catch((err) => { next(err) })
}
