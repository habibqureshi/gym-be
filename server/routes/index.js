const router = require("express").Router();

router.use('/auth', require('./Auth'))
module.exports = router;