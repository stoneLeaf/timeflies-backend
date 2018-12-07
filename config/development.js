module.exports = {
  env: 'development',
  port: process.env.PORT || 3000,
  db_uri: 'mongodb://localhost:27017/timeflies',
  jwt_secret: 'secret',
  log_level: 'silly'
}
