const router = require("express").Router();
const {
  getCities,
  createNewCity,
  updateCity,
  deleteCity,
} = require("../../controllers/City");

router.get("/", getCities);
router.post("/", createNewCity);
router.put("/", updateCity);
router.delete("/", deleteCity);

module.exports = router;
