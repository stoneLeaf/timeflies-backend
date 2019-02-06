const router = require('express').Router()

const ProjectsController = require('../../../controllers/projects_controller')
const StatsController = require('../../../controllers/stats_controller')
const auth = require('../../../middlewares/auth')

router.all('*', auth.required)

router.param('project_id', ProjectsController.setProjectOnParam)

router.get('/projects', StatsController.getProjectGlobal)
router.get('/projects/:project_id', StatsController.getProjectById)

module.exports = router
