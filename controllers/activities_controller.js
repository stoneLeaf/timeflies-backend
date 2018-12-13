const mongoose = require('mongoose')
const Activity = mongoose.model('Activity')

var ActivitiesController = exports = module.exports = {}

ActivitiesController.create = function (req, res, next) {
  req.body.owner = req.user._id
  req.body.project = req.project._id
  new Activity(req.body).save().then(function (activity) {
    res.status(200).json({ activity: activity.publicJSON() })
  }).catch((err) => { next(err) })
}
