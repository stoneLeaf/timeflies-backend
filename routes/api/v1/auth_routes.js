const router = require('express').Router()
const AuthController = require('../../../controllers/auth_controller')

router.post('/login', AuthController.login)

module.exports = router
