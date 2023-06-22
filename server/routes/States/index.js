const router = require("express").Router();
const { getStates } = require("../../controllers/States");

router.get("/", getStates);

module.exports = router;
