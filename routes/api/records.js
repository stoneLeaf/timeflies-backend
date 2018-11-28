const router = require('express').Router()
const logger = require('winston')

router.param('record_id', function (req, res, next, value, name) {
  logger.debug('Fetching record from :record_id param')
  req.record = 'dummy'
  next()
})

router.get('/records', function (req, res, next) {
  res.status(200).json({ debug: 'records list' })
})

router.post('/records', function (req, res, next) {
  res.status(200).json({ debug: 'records create' })
})

router.get('/records/:record_id', function (req, res, next) {
  res.status(200).json({ debug: 'records read id ' + req.params.record_id })
})

router.delete('/records/:record_id', function (req, res, next) {
  res.status(200).json({ debug: 'records delete id ' + req.params.record_id })
})

module.exports = router
