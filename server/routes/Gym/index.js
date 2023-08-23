const router = require("express").Router();
const {
  getGym,
  createNewGym,
  updateGym,
  deleteGym,
  createGymSchedule,
  getGymSchedule,
  updateGymSchedule,
} = require("../../controllers/Gym");

router.get("/", getGym);
router.post("/", createNewGym);
router.put("/", updateGym);
router.delete("/", deleteGym);
router.post("/schedule", createGymSchedule);
router.put("/schedule", updateGymSchedule);
router.get("/schedule", getGymSchedule);

module.exports = router;
