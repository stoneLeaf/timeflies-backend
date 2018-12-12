const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')

var ProjectSchema = new Schema({
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
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

ProjectSchema.pre('validate', function () {
  if (this.name) this.slug = slugify(this.name, { lower: true }).substr(0, 70)
})

// TODO: validate name and slug uniqueness in User scope
// TODO: add pre/post remove middleware removing dependent activities

module.exports = mongoose.model('Project', ProjectSchema)
