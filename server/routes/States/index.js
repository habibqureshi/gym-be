const router = require("express").Router();
const {
  getStates,
  createNewState,
  updateState,
} = require("../../controllers/States");

router.get("/", getStates);
router.post("/", createNewState);
router.put("/", updateState);
router.delete("/", deleteState);

module.exports = router;
