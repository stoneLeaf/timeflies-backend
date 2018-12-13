const router = require('express').Router()

// TODO: should not be here
router.get('/ping', function (req, res, next) {
  res.status(200).json({ status: 'ok' })
})

router.use(require('./auth_routes'))
router.use(require('./users_routes'))
router.use(require('./activities_routes'))
router.use(require('./projects_routes'))

module.exports = router
