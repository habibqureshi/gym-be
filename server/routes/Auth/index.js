const router = require("express").Router();
const authController = require("../../controllers/Auth");
const {
  signUpValidatorUser,
  signInValidator,
} = require("../../utils/validators/validators");

// Home page route.
router.post("/signUp", signUpValidatorUser(), authController.create);

// About page route.
router.post("/signIn", signInValidator(), authController.signIn);
router.get("/signOut", authController.signOutUser);

// my profile route
router.get("/myProfile", authController.myProfile);

module.exports = router;
