const router = require("express").Router();

router.use('/auth', require('./Auth'))
router.use('/bookings', require('./Bookings'))
module.exports = router;