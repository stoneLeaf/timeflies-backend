const router = require('express').Router()

const ProjectsController = require('../../../controllers/projects_controller')
const ActivitiesController = require('../../../controllers/activities_controller')
const auth = require('../../../middlewares/auth')

router.all('*', auth.required)

router.param('project_id', ProjectsController.setProjectOnParam)

router.post('/', ProjectsController.create)
router.get('/', ProjectsController.getAll)
router.get('/:project_id', ProjectsController.getById)
router.patch('/:project_id', ProjectsController.update)
router.delete('/:project_id', ProjectsController.delete)

router.post('/:project_id/activities', ActivitiesController.create)
router.get('/:project_id/activities', ActivitiesController.getAll)

module.exports = router
