const router = require("express").Router();
const { getCities } = require("../../controllers/City");

router.get("/", getCities);

module.exports = router;
