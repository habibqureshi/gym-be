const router = require('express').Router()
const adminController = require('../../controllers/Admin')
const checkAdmin = require('../../middleware/Auth/checkAdmin')
const { signUpValidatorCoach } = require('../../utils/validators/validators')
router.post('/createCoach', checkAdmin, signUpValidatorCoach(), adminController.createCoach)
router.post('/creteSchedule', checkAdmin, adminController.createSchedule)

module.exports = router