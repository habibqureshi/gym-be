const router = require("express").Router();
const adminController = require("../../controllers/Admin");
const checkAdmin = require("../../middleware/Auth/checkAdmin");
const { signUpValidatorCoach } = require("../../utils/validators/validators");
router.post(
  "/createCoach",
  checkAdmin,
  signUpValidatorCoach(),
  adminController.createCoach
);
router.put("/update", checkAdmin, adminController.update);

module.exports = router;
