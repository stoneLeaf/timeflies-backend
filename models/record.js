const mongoose = require('mongoose')
const Schema = mongoose.Schema

var RecordSchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    min: this.start // FIXME: does this actually work?
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  project: { type: Schema.Types.ObjectId, ref: 'Project' }
})

module.exports = mongoose.model('Record', RecordSchema)
