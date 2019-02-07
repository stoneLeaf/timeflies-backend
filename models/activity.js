const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ActivitySchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    maxlength: 255
  }
}, { timestamps: true })

ActivitySchema.pre('validate', function () {
  if (this.startDate && this.startDate > (new Date())) {
    this.invalidate('startDate', 'An activity cannot start in the future')
  }
})

ActivitySchema.pre('validate', function () {
  if (this.endDate && this.endDate > (new Date())) {
    this.invalidate('startDate', 'An activity cannot end in the future')
  }
})

ActivitySchema.pre('validate', function () {
  if (this.endDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'An activity must end after its starting date')
  }
})

ActivitySchema.pre('validate', function () {
  // TODO: feels not DRY enough, I'm sure there's some logical simplification
  if (this.startDate && !this.endDate) {
    // Cannot have two running activities at once
    // This check is enough because we also invalidate dates happening in the futures
    return mongoose.model('Activity').findOne({
      _id: { $ne: this._id },
      owner: this.owner,
      endDate: { $exists: false }
    }).exec().then((runningActivity) => {
      if (runningActivity) {
        this.invalidate('startDate', 'An activity is already running')
      } else {
        // Cannot start before any other activity
        return mongoose.model('Activity').findOne({
          owner: this.owner,
          endDate: { $gt: this.startDate }
        }).exec().then((overlappingActivity) => {
          if (overlappingActivity) {
            this.invalidate('startDate', 'This activity overlaps an existing one')
          }
        })
      }
    })
  } else if (this.startDate && this.endDate) {
    return mongoose.model('Activity').findOne().or([
      { _id: { $ne: this._id },
        owner: this.owner,
        startDate: { $lt: this.startDate },
        endDate: { $gt: this.startDate } },
      { _id: { $ne: this._id },
        owner: this.owner,
        startDate: { $lt: this.endDate },
        endDate: { $gt: this.endDate }
      }]).exec().then((overlappingActivity) => {
      if (overlappingActivity) {
        this.invalidate('startDate', 'This activity overlaps an existing one')
      }
    })
  }
})

/**
 * Method used to increment or decrement parent project totalTime.
 *
 * @param action 'add' or 'remove'
 */
ActivitySchema.methods.updateParentProjectTime = function (action) {
  if (!this.endDate) return
  return mongoose.model('Project').findOne({ _id: this.project }).exec()
    .then(project => {
      let duration = (this.endDate.getTime() - this.startDate.getTime()) / 1000
      if (action === 'remove') {
        duration = duration * -1
      }
      project.shiftTotalTime(duration)
      return project.save()
    })
}

/**
 * Post save hook used to increment the parent project totalTime.
 */
ActivitySchema.post('save', function () {
  this.updateParentProjectTime('add')
})

/**
 * Post remove hook used to decrement the parent project totalTime.
 */
ActivitySchema.post('remove', function () {
  this.updateParentProjectTime('remove')
})

ActivitySchema.methods.publicJSON = function () {
  let publicJSON = this.toObject()
  publicJSON.id = publicJSON._id
  delete publicJSON._id
  delete publicJSON.__v
  return publicJSON
}

module.exports = mongoose.model('Activity', ActivitySchema)
