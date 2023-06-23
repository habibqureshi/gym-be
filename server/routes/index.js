const router = require("express").Router();

router.use("/auth", require("./Auth"));
router.use("/bookings", require("./Bookings"));
router.use("/coach", require("./Coach"));
router.use("/gymnast", require("./Gymnast"));
router.use("/admin", require("./Admin"));
router.use("/states", require("./States"));
router.use("/city", require("./City"));
router.use("/gym", require("./Gym"));
module.exports = router;
