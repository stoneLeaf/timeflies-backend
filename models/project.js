const mongoose = require('mongoose')
const Schema = mongoose.Schema

// TODO: validate name and slug uniqueness in User scope

var ProjectSchema = new Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 160
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
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  records: [{ type: Schema.Types.ObjectId, ref: 'Record' }]
})

// TODO: pre remove middleware removing dependent records

module.exports = mongoose.model('Project', ProjectSchema)
