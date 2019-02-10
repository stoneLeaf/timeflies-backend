const router = require('express').Router()

const auth = require('../../../middlewares/auth')
const UsersController = require('../../../controllers/users_controller')

router.post('/users', UsersController.create)
router.get('/profile', auth.required, UsersController.getProfile)
router.patch('/profile', auth.required, UsersController.update)

module.exports = router
