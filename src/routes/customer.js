const router = require('express').Router()
const {CustomerController} = require('../controllers/index')

router.post('/login', CustomerController.login)

router.post('/register', CustomerController.register)

// protect below endpoints
router.use(CustomerController.verifyAuthenticationAndAuthorization)

router.get('/profiles/:id', CustomerController.getProfile)

router.post('/profiles/:id', CustomerController.updateProfile)

router.post('/profiles/:id/changePassword', CustomerController.changePassword)

// router.post('/profiles/:id/changePhoto', uploadProfileImage.single('image'), CustomerController.changeProfileImage)

// router.delete('/profiles/:id/delete', CustomerController.deleteProfile)

module.exports = router