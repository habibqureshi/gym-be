const router = require("express").Router();
const {
  coachBookingsByDate,
  addNewChildren,
  getChildrenByUserId,
  getAllGymnast,
  deleteChildren,
  updateChildren,
} = require("../../controllers/Gymnast");

router.get("/", getAllGymnast);
router.get("/coach/info", coachBookingsByDate);
router.post("/children", addNewChildren);
router.get("/children", getChildrenByUserId);
router.delete("/children", deleteChildren);
router.put("/children", updateChildren);

module.exports = router;
