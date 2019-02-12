// No fallback values because if they're not set, something must be wrong
// TODO: check for values and shut down server if none?
module.exports = {
  env: 'production',
  port: process.env.PORT,
  db_uri: process.env.MONGODB_URI,
  jwt_secret: process.env.JWT_SECRET,
  log_level: process.env.LOG_LEVEL || 'warn'
}
