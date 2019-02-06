const mongoose = require('mongoose')

const Project = mongoose.model('Project')
const Activity = mongoose.model('Activity')

var StatsController = exports = module.exports = {}

StatsController.onlyAllowOwner = function (req, res, next) {
  if (req.user._id.toString() !== req.project.owner.toString()) {
    res.status(403).json({ errors: 'Access denied' })
  } else {
    next()
  }
}

StatsController.getProjectGlobal = function (req, res, next) {
  res.status(501).json({ message: 'Not implemented' })
}

StatsController.getProjectById = [StatsController.onlyAllowOwner, function (req, res, next) {
  res.status(501).json({ message: 'Not implemented' })
}]
