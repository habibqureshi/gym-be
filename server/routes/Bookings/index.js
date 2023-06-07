const router = require('express').Router()
const { myBookings } = require('../../controllers/Bookings')

router.get('/bookings', myBookings)

module.exports = router
