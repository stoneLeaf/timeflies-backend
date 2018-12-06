// Environnement fallback
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const app = require('./app')

var server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port)
})
