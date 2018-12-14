const router = require('express').Router()
const logger = require('winston')

const auth = require('../../middlewares/auth')
const ActivitiesController = require('../../controllers/activities_controller')
const ProjectsController = require('../../controllers/projects_controller')

router.all('*', auth.required)

router.param('project_id', ProjectsController.setProjectOnParam)
router.param('activity_id', ActivitiesController.setActivityOnParam)

router.post('/projects/:project_id/activities', ActivitiesController.create)
router.patch('/activities/:activity_id', ActivitiesController.update)
router.delete('/activities/:activity_id', ActivitiesController.delete)
router.get('/activities/:activity_id', ActivitiesController.getById)

router.get('/activities', ActivitiesController.getAll)

module.exports = router
