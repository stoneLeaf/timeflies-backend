const mongoose = require('mongoose')

const Moment = require('moment')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)

const Project = mongoose.model('Project')
const Activity = mongoose.model('Activity')

const StatsController = exports = module.exports = {}

StatsController.onlyAllowOwner = function (req, res, next) {
  if (req.user._id.toString() !== req.project.owner.toString()) {
    res.status(403).json({ errors: 'Access denied' })
  } else {
    next()
  }
}

StatsController.getProjectStats = function (req, res, next) {
  const projectFilter = {}
  if (req.project) {
    projectFilter._id = req.project._id
  }

  Project.find(projectFilter).exec().then(arr => {
    const globalTotal = arr.reduce((acc, v) => {
      return acc + v.totalTime
    }, 0)

    if (!req.query.firstDay || !req.query.lastDay) {
      return res.status(200).json({ globalTimeCount: globalTotal })
    }

    const start = new Date(req.query.firstDay).setHours(0, 0, 0, 0)
    const end = new Date(req.query.lastDay).setHours(24, 0, 0, 0)

    const activityFilter = {}
    if (req.project) {
      activityFilter.project = req.project._id
    }

    return Activity.find(activityFilter).or([
      {
        owner: req.user._id,
        startDate: { $lt: start },
        endDate: { $gt: end }
      },
      {
        owner: req.user._id,
        startDate: { $gte: start, $lt: end }
      },
      {
        owner: req.user._id,
        endDate: { $gt: start, $lte: end }
      }
    ])
      .then(activities => {
        // Getting days array ready
        const days = []
        // eslint-disable-next-line no-unmodified-loop-condition
        for (var currentDay = new Date(start); currentDay < end; currentDay.setDate(currentDay.getDate() + 1)) {
          days.push({
            start: new Date(new Date(currentDay).setHours(0)),
            end: new Date(new Date(currentDay).setHours(24)),
            amount: 0
          })
        }

        // Filling daily stats
        for (const activity of activities) {
          if (!activity.endDate) {
            activity.endDate = new Date()
          }
          for (const day of days) {
            const intersection = moment.range(activity.startDate, activity.endDate)
              .intersect(moment.range(day.start, day.end))
            if (intersection !== null) {
              day.amount += intersection.valueOf() / 1000
            }
          }
        }

        const intervalTimeCount = days.reduce((acc, v) => {
          return acc + v.amount
        }, 0)

        // Transforming days array for output
        const outputDays = days.map(day => {
          return {
            day: day.start,
            timeCount: day.amount
          }
        })

        return res.status(200).json({
          globalTimeCount: globalTotal,
          intervalTimeCount: intervalTimeCount,
          days: outputDays
        })
      })
  })
}
