const router = require('express').Router()
const { getAllCoach, saveSchedule } = require('../../controllers/Coach')

router.get('/', getAllCoach)
router.post('/', saveSchedule)

module.exports = router
