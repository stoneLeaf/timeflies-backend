const router = require('express').Router()

router.get('/ping', function (req, res, next) {
  res.status(200).json({ status: 'ok' })
})

router.use(require('./records'))
router.use(require('./projects'))

module.exports = router
