const router = require('express').Router()
const authController = require('../../controllers/Auth')
const { signUpValidator, signInValidator } = require('../../utils/validators/validators')

// Home page route.
router.post("/signUp", signUpValidator(), authController.create);

// About page route.
router.post("/signIn", signInValidator(), authController.signIn);

// my profile route
router.get("/myProfile", authController.myProfile);

module.exports = router