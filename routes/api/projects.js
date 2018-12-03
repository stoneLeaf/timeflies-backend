const router = require('express').Router()
const ProjectsController = require('../../controllers/projects_controller')
const auth = require('../../middlewares/auth')

router.param('project_id', ProjectsController.setProjectOnParam)

router.get('/projects', function (req, res, next) {
  res.status(200).json({ debug: 'projects list' })
})

router.post('/projects', auth.required, ProjectsController.create)

router.get('/projects/:project_id', ProjectsController.read)

router.get('/projects/:project_id/records', function (req, res, next) {
  res.status(200).json({ debug: 'projects id ' + req.params.project_id + ' records' })
})

router.delete('/projects/:project_id', function (req, res, next) {
  res.status(200).json({ debug: 'projects delete id ' + req.params.project_id })
})

module.exports = router
