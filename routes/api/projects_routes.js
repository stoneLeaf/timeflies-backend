const router = require('express').Router()
const ProjectsController = require('../../controllers/projects_controller')
const auth = require('../../middlewares/auth')

router.all('*', auth.required)

router.param('project_id', ProjectsController.setProjectOnParam)

router.post('/projects', ProjectsController.create)
router.get('/projects', ProjectsController.getAll)
router.get('/projects/:project_id', ProjectsController.getById)
router.patch('/projects/:project_id', ProjectsController.update)
router.delete('/projects/:project_id', ProjectsController.delete)

module.exports = router
