const router = require('express').Router()
const logger = require('winston')

router.param('project_id', function (req, res, next, value, name) {
  logger.debug('Fetching project from :project_id param')
  req.project = 'dummy'
  next()
})

router.get('/projects', function (req, res, next) {
  res.status(200).json({ debug: 'projects list' })
})

router.post('/projects', function (req, res, next) {
  res.status(200).json({ debug: 'project create' })
})

router.get('/projects/:project_id', function (req, res, next) {
  res.status(200).json({ debug: 'projects read id ' + req.params.project_id })
})

router.get('/projects/:project_id/records', function (req, res, next) {
  res.status(200).json({ debug: 'projects id ' + req.params.project_id + ' records' })
})

router.delete('/projects/:project_id', function (req, res, next) {
  res.status(200).json({ debug: 'projects delete id ' + req.params.project_id })
})

module.exports = router
