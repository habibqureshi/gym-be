const router = require('express').Router()
const { getAllCoach } = require('../../controllers/Coach')

router.get('/', getAllCoach)

module.exports = router
