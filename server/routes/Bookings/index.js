const router = require("express").Router();
const {
  myBookings,
  createNewBooking,
  deleteBooking,
  updateBookings,
  getAllBookings,
} = require("../../controllers/Bookings");

router.get("/all", getAllBookings);
router.get("/", myBookings);
router.post("/", createNewBooking);
router.put("/", updateBookings);
router.delete("/", deleteBooking);

module.exports = router;
