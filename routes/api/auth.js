const router = require('express').Router()
const AuthController = require('../../controllers/auth_controller')

router.post('/auth', AuthController.login)

module.exports = router
