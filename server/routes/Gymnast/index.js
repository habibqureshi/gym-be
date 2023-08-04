const router = require("express").Router();
const {
  coachBookingsByDate,
  addNewChildren,
  getChildrenByUserId,
} = require("../../controllers/Gymnast");

router.get("/coach/info", coachBookingsByDate);
router.post("/children", addNewChildren);
router.get("/children", getChildrenByUserId);

module.exports = router;
