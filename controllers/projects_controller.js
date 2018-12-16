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
  // TODO: add checks to the input (numbers?, max and min values)
  let limit = req.body.limit || 5
  let offset = req.body.offset || 0
  let response = {}

  // TODO: could probably make a single query instead of count() + find()
  Project.countDocuments({ owner: req.user._id }).then(function (total) {
    response.total = total
  }).then(function () {
    return Project.find({ owner: req.user._id }).sort({ name: 'asc' })
      .skip(offset).limit(limit).exec().then(function (arr) {
        response.limit = limit
        response.offset = offset
        response.projects = arr.map(project => {
          return project.publicJSON()
        })
        res.status(200).json(response)
      })
  }).catch((err) => { next(err) })
}

ProjectsController.update = [ProjectsController.onlyAllowOwner, function (req, res, next) {
  req.project.set(req.body).save().then(function (updatedProject) {
    res.status(200).json({ project: updatedProject.publicJSON() })
  }).catch((err) => { next(err) })
}]

ProjectsController.delete = [ProjectsController.onlyAllowOwner, function (req, res, next) {
  // TODO: could not find a way to trigger removal from the document itself
  Project.deleteOne({ _id: req.project._id }).then(function () {
    res.status(200).send({ message: 'Project deleted' })
  }).catch((err) => { next(err) })
}]
