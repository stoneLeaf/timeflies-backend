const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')

var ProjectSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100
  },
  slug: {
    type: String,
    lowercase: true,
    minlength: 2,
    maxlength: 70
  },
  description: {
    type: String,
    trim: true,
    maxlength: 255
  },
  totalTime: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

ProjectSchema.pre('validate', function () {
  if (this.name) this.slug = slugify(this.name, { lower: true }).substr(0, 70)
})

ProjectSchema.pre('validate', function () {
  if (this.name && this.owner) {
    return mongoose.model('Project').findOne({
      _id: { $ne: this._id },
      owner: this.owner,
      name: this.name
    }).exec().then((project) => {
      if (project) this.invalidate('name', 'Name taken by another of your project')
    })
  }
})

ProjectSchema.methods.publicJSON = function () {
  let publicJSON = this.toObject()
  publicJSON.id = publicJSON._id
  delete publicJSON._id
  delete publicJSON.__v
  return publicJSON
}

/**
 * Method used to add or remove time from totalTime.
 *
 * @param shift positive or negative integer representing the time in seconds
 */
ProjectSchema.methods.shiftTotalTime = function (shift) {
  this.totalTime = this.totalTime + shift
}

// TODO: add pre/post remove middleware removing dependent activities

module.exports = mongoose.model('Project', ProjectSchema)
