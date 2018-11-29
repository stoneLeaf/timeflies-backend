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
})

// TODO: pre remove middleware removing dependent projects and records

module.exports = mongoose.model('User', UserSchema)
