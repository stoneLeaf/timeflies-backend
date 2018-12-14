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

router.get('/activities', function (req, res, next) {
  res.status(200).json({ debug: 'activities list' })
})

router.get('/activities/:activity_id', function (req, res, next) {
  res.status(200).json({ debug: 'activities read id ' + req.params.activity_id })
})

router.delete('/activities/:activity_id', function (req, res, next) {
  res.status(200).json({ debug: 'activities delete id ' + req.params.activity_id })
})

module.exports = router
