const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ActivitySchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    min: this.start // FIXME: does this actually work?
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
}, { timestamps: true })

ActivitySchema.methods.publicJSON = function () {
  let publicJSON = this.toObject()
  publicJSON.id = publicJSON._id
  delete publicJSON._id
  delete publicJSON.__v
  return publicJSON
}

module.exports = mongoose.model('Activity', ActivitySchema)
