const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const BCRYPT_ROUNDS = 12

var UserSchema = new Schema({
  // Nesting public data
  profile: {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
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
    },
    hashedEmail: {
      type: String
    },
    preferences: {
      seenDashboardNotice: {
        type: Boolean,
        default: false
      }
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
UserSchema.pre('validate', function () {
  return mongoose.model('User').findOne({ 'profile.email': this.profile.email }).exec()
    // Using arrow function to keep context
    .then((results) => {
      if (results) this.invalidate('email', 'is already taken')
    })
})

UserSchema.pre('validate', function () {
  if (!this.profile.email) return
  // TODO: maybe check if changed, in case of an update
  this.profile.hashedEmail = crypto.createHash('md5').update(this.profile.email.trim()).digest('hex')
})

UserSchema.pre('save', function () {
  return bcrypt.hash(this.password, BCRYPT_ROUNDS).then((hash) => {
    this.password = hash
  })
})

// Promise based method
UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

// TODO: add pre/post remove middleware removing dependent projects and activities

module.exports = mongoose.model('User', UserSchema)
