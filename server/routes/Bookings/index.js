const router = require('express').Router()
const { myBookings, createBooking, deleteBooking } = require('../../controllers/Bookings')

router.get('/', myBookings)
router.post('/', createBooking)
// router.put('/:id', myBookings)
router.delete('/:id', deleteBooking)

module.exports = router
