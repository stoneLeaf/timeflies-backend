const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const BCRYPT_ROUNDS = 12

var UserSchema = new Schema({
  // Nesting public data
  profile: {
    email: {
      type: String,
      unique: true,
      // As per RFC 3696 errata ID 1690
      maxlength: 254,
      trim: true,
      lowercase: true,
      required: 'An email address is required',
      // Voluntarily very permissive (comes from the Devise ruby gem)
      match: [/^[^@\s]+@[^@\s]+$/, 'The email address is invalid']
    }
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 30,
    match: [/^\S+$/, 'The password can not contain spaces.'],
    required: 'The password is required.'
  }
}, { timestamps: true })

// Because the unique option only creates the index and does not do validation
UserSchema.pre('validate', function (next) {
  this.constructor.findOne({ 'profile.email': this.profile.email }).exec()
    // Using arrow function to keep context
    .then((results) => {
      if (results) this.invalidate('email', 'is already taken')
      next()
    }).catch((err) => { next(err) })
})

UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, BCRYPT_ROUNDS).then((hash) => {
    this.password = hash
    next()
  })
})

// Asynchronous method
UserSchema.methods.validatePassword = function (password, callback) {
  bcrypt.compare(password, this.password_hash).then(function (result) {
    callback(result)
  })
}

// TODO: add pre/post remove middleware removing dependent projects and records

module.exports = mongoose.model('User', UserSchema)
