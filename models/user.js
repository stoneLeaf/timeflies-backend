const mongoose = require('mongoose')
const Schema = mongoose.Schema

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    // As per RFC 3696 errata ID 1690
    maxlength: 254,
    trim: true,
    lowercase: true,
    required: 'An email address is required',
    // Very permissive (comes from the Devise ruby gem)
    match: [/^[^@\s]+@[^@\s]+$/, 'The email address is invalid']
  }
}, { timestamps: true })

// Because the unique option only creates the index and does not do validation
UserSchema.pre('validate', function (next) {
  // Used arrow function to keep context
  this.constructor.findOne({ email: this.email }).exec().then((results) => {
    if (results) this.invalidate('email', 'is already taken')
    next()
  }).catch((err) => { next(err) })
})

// TODO: add pre/post remove middleware removing dependent projects and records

module.exports = mongoose.model('User', UserSchema)
