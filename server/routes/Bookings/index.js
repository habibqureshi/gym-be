const router = require("express").Router();
const {
  myBookings,
  createNewBooking,
  deleteBooking,
  updateBookings,
  getAllBookings,
  checkout,
  confirmCheckout,
} = require("../../controllers/Bookings");

router.get("/all", getAllBookings);
router.get("/", myBookings);
router.post("/", createNewBooking);
router.put("/", updateBookings);
router.delete("/", deleteBooking);
router.post("/checkout", checkout);
router.post("/confirm/checkout", confirmCheckout);

module.exports = router;
