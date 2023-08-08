const router = require("express").Router();
const {
  coachBookingsByDate,
  addNewChildren,
  getChildrenByUserId,
  getAllGymnast,
} = require("../../controllers/Gymnast");

router.get("/", getAllGymnast);
router.get("/coach/info", coachBookingsByDate);
router.post("/children", addNewChildren);
router.get("/children", getChildrenByUserId);

module.exports = router;
