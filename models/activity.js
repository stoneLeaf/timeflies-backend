const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ActivitySchema = new Schema({
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
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
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
      _id: {$ne: this._id},
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
      { _id: {$ne: this._id},
        owner: this.owner,
        startDate: { $lt: this.startDate },
        endDate: { $gt: this.startDate } },
      { _id: {$ne: this._id},
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

ActivitySchema.statics.getUserRunningActivity = function (ownerId) {
  return mongoose.model('Activity').findOne({
    owner: ownerId,
    endDate: { $exists: false }
  }).exec().then(runningActivity => runningActivity)
}

ActivitySchema.statics.checkForConflicts = function (activity) {

  return mongoose.model('Activity').findOne({
    owner: ownerId,
    endDate: { $exists: false }
  }).exec().then(runningActivity => runningActivity)
}

ActivitySchema.methods.publicJSON = function () {
  let publicJSON = this.toObject()
  publicJSON.id = publicJSON._id
  delete publicJSON._id
  delete publicJSON.__v
  return publicJSON
}

module.exports = mongoose.model('Activity', ActivitySchema)
