const router = require("express").Router();

router.use("/auth", require("./Auth"));
router.use("/bookings", require("./Bookings"));
router.use("/coachs", require("./Coach"));
router.use("/admin", require("./Admin"));
router.use("/states", require("./States"));
router.use("/city", require("./City"));
router.use("/gym", require("./Gym"));
module.exports = router;
