const router = require("express").Router();
const {
  myBookings,
  createNewBooking,
  deleteBooking,
  updateBookings,
} = require("../../controllers/Bookings");

router.get("/", myBookings);
router.post("/", createNewBooking);
router.put("/", updateBookings);
// router.put('/:id', myBookings)
router.delete("/", deleteBooking);

module.exports = router;
