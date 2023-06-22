const router = require("express").Router();
const { getGym } = require("../../controllers/Gym");

router.get("/", getGym);

module.exports = router;
