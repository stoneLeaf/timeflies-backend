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
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
}, { timestamps: true })

module.exports = mongoose.model('Activity', ActivitySchema)
