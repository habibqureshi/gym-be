const router = require("express").Router();
const { coachBookingsByDate } = require("../../controllers/Gymnast");

router.get("/coach/info", coachBookingsByDate);

module.exports = router;
