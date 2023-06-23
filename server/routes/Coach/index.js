const router = require("express").Router();
const {
  getAllCoach,
  saveSchedule,
  updatePrivateTime,
  getCoachPublicSlots,
  getPrivateCoach,
} = require("../../controllers/Coach");

router.get("/", getAllCoach);
router.get("/private", getPrivateCoach);
// router.post("/", saveSchedule);
router.put("/open/slots", updatePrivateTime);
router.get("/my/schedule", getCoachPublicSlots);

module.exports = router;
