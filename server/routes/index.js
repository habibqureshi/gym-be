const router = require("express").Router();

router.use('/auth', require('./Auth'))
router.use('/bookings', require('./Bookings'))
router.use('/coachs', require('./Coach'))
module.exports = router;