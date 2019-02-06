const router = require('express').Router()

// TODO: should not be here
router.get('/ping', function (req, res, next) {
  res.status(200).json({ status: 'ok' })
})

router.use(require('./users_routes'))
router.use('/auth', require('./auth_routes'))
router.use('/activities', require('./activities_routes'))
router.use('/projects', require('./projects_routes'))
router.use('/stats', require('./stats_routes'))

module.exports = router
