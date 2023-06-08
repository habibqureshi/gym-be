const router = require('express').Router()
const { myBookings, createNewBooking, deleteBooking } = require('../../controllers/Bookings')

router.get('/', myBookings)
router.post('/', createNewBooking)
// router.put('/:id', myBookings)
router.delete('/', deleteBooking)

module.exports = router
