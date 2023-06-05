const router = require('express').Router()



// Home page route.
router.get("/signUp", function (req, res) {
    res.send("SignUp route");
});

// About page route.
router.get("/signIn", function (req, res) {
    res.send("SignIn route");
});

// my profile route
router.get("/myProfile", function (req, res) {
    res.send("myProfile Route");
});

module.exports = router