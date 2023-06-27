const router = require("express").Router();
const {
  getGym,
  createNewGym,
  updateGym,
  deleteGym,
} = require("../../controllers/Gym");

router.get("/", getGym);
router.post("/", createNewGym);
router.put("/", updateGym);
router.delete("/", deleteGym);

module.exports = router;
