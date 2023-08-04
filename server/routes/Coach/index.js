const router = require("express").Router();
const {
  getAllCoach,
  saveSchedule,
  addCoachSlots,
  getCoachPublicSlots,
  getPrivateCoach,
  getCoachSchedule,
  deleteSchedule,
} = require("../../controllers/Coach");

router.get("/", getAllCoach);
router.get("/private", getPrivateCoach);
// router.post("/", saveSchedule);
router.post("/open/slots", addCoachSlots);
router.post("/my/schedule", getCoachSchedule);
router.delete("/my/schedule", deleteSchedule);

module.exports = router;
