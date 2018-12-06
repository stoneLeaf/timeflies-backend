module.exports = {
  env: 'test',
  port: process.env.PORT || 3000,
  db_uri: 'mongodb://localhost:27017/timeflies_test',
  jwt_secret: 'secret'
}
