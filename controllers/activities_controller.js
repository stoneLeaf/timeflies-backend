const mongoose = require('mongoose')
const Activity = mongoose.model('Activity')

var ActivitiesController = exports = module.exports = {}

ActivitiesController.create = function (req, res, next) {
  req.body.owner = req.user._id
  req.body.project = req.project._id
  return (new Activity(req.body)).save().then(function (newActivity) {
    // TODO: the activity URI should not be hard-coded
    res.set('location', `/api/activities/${newActivity.id}`)
      .status(201).json({ activity: newActivity.publicJSON() })
  }).catch((err) => { next(err) })
}
