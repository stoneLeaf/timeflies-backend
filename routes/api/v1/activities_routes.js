const router = require('express').Router()

const auth = require('../../../middlewares/auth')
const ActivitiesController = require('../../../controllers/activities_controller')

router.all('*', auth.required)

router.param('activity_id', ActivitiesController.setActivityOnParam)

router.get('/', ActivitiesController.getAll)
router.get('/:activity_id', ActivitiesController.getById)
router.patch('/:activity_id', ActivitiesController.update)
router.delete('/:activity_id', ActivitiesController.delete)

module.exports = router
