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

ProjectSchema.pre('validate', function () {
  if (this.name && this.owner) {
    return mongoose.model('Project').findOne({
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

// TODO: add pre/post remove middleware removing dependent activities

module.exports = mongoose.model('Project', ProjectSchema)
