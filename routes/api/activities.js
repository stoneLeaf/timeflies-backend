const router = require('express').Router()
const logger = require('winston')

router.param('activity_id', function (req, res, next, value, name) {
  logger.debug('Fetching activity from :activity_id param')
  req.activity = 'dummy'
  next()
})

router.get('/activities', function (req, res, next) {
  res.status(200).json({ debug: 'activities list' })
})

router.post('/activities', function (req, res, next) {
  res.status(200).json({ debug: 'activities create' })
})

router.get('/activities/:activity_id', function (req, res, next) {
  res.status(200).json({ debug: 'activities read id ' + req.params.activity_id })
})

router.delete('/activities/:activity_id', function (req, res, next) {
  res.status(200).json({ debug: 'activities delete id ' + req.params.activity_id })
})

module.exports = router
