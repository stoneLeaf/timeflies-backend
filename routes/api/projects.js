const router = require('express').Router()
const ProjectsController = require('../../controllers/projects_controller')
const auth = require('../../middlewares/auth')

router.param('project_id', ProjectsController.setProjectOnParam)

router.post('/projects', auth.required, ProjectsController.create)

router.get('/projects', auth.required, ProjectsController.getAll)

router.get('/projects/:project_id', auth.required, ProjectsController.getById)

router.patch('/projects/:project_id', auth.required, ProjectsController.update)

router.get('/projects/:project_id/activities', function (req, res, next) {
  res.status(200).json({ debug: 'projects id ' + req.params.project_id + ' activities' })
})

router.delete('/projects/:project_id', function (req, res, next) {
  res.status(200).json({ debug: 'projects delete id ' + req.params.project_id })
})

module.exports = router
