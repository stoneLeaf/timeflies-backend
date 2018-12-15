const mongoose = require('mongoose')
const Activity = mongoose.model('Activity')

var ActivitiesController = exports = module.exports = {}

ActivitiesController.setActivityOnParam = function (req, res, next, id, name) {
  Activity.findById(id).exec().then(function (activity) {
    if (!activity) throw new Error('Not found')
    req.activity = activity
    next()
  }).catch(function (err) {
    if (err.name === 'CastError' || err.message === 'Not found') {
      res.status(404).json({ errors: 'Activity not found' })
    } else {
      next(err)
    }
  })
}

ActivitiesController.onlyAllowOwner = function (req, res, next) {
  if (req.activity.owner.toString() !== req.user._id.toString()) {
    res.status(403).json({ errors: 'Access denied' })
  } else {
    next()
  }
}

ActivitiesController.create = function (req, res, next) {
  req.body.owner = req.user._id
  req.body.project = req.project._id
  return (new Activity(req.body)).save().then(function (newActivity) {
    // TODO: the activity URI should not be hard-coded
    res.set('location', `/api/activities/${newActivity.id}`)
      .status(201).json({ activity: newActivity.publicJSON() })
  }).catch((err) => { next(err) })
}

ActivitiesController.update = [ActivitiesController.onlyAllowOwner, function (req, res, next) {
  req.activity.set(req.body).save().then(function (updatedActivity) {
    res.status(200).json({ activity: updatedActivity.publicJSON() })
  }).catch(function (err) { next(err) })
}]

ActivitiesController.delete = [ActivitiesController.onlyAllowOwner, function (req, res, next) {
  Activity.deleteOne({ _id: req.activity._id }).then(function () {
    res.status(200).json({ message: 'Activity deleted' })
  }).catch((err) => { next(err) })
}]

ActivitiesController.getById = [ActivitiesController.onlyAllowOwner, function (req, res, next) {
  res.status(200).json({ activity: req.activity.publicJSON() })
}]

ActivitiesController.getAll = function (req, res, next) {
  // TODO: add checks to the inputs (numbers?, valid dates?, max and min values)
  let response = {}
  response.limit = req.body.limit || 5
  response.offset = req.body.offset || 0

  let filters = { owner: req.user._id }
  if (req.project) filters.project = req.project._id
  if (req.body.before) filters.endDate = { $lte: req.body.before }
  if (req.body.after) filters.startDate = { $gte: req.body.after }

  Activity.countDocuments(filters).then(function (total) {
    response.total = total
  }).then(function () {
    return Activity.find(filters).sort({ startDate: 'desc' })
      .skip(response.offset).limit(response.limit).exec().then(function (arr) {
        response.activities = arr.map((activity) => activity.publicJSON())
        res.status(200).json(response)
      })
  }).catch((err) => { next(err) })
}
