const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const JWTStrategy = require('passport-jwt').Strategy
const mongoose = require('mongoose')
const User = mongoose.model('User')
const config = require('./index')

passport.use(new LocalStrategy({ usernameField: 'email', session: false },
  function (email, password, done) {
    User.findOne({ 'profile.email': email }).then((user) => {
      if (!user) return done(null, false)
      user.validatePassword(password).then(function (match) {
        if (!match) return done(null, false)
        return done(null, user)
      })
    }).catch((err) => { done(err) })
  }
))

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt_secret
},
function (jwtPayload, done) {
  User.findOne({ 'profile.email': jwtPayload.profile.email }).then((user) => {
    if (!user) return done(null, false)
    return done(null, user)
  }).catch((err) => { done(err) })
}))
