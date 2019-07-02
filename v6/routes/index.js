const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");


//root route
router.get("/", (req, res) => {
    res.render("landing.ejs");
});

//show register form
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

//Sign Up logic
router.post("/register", (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        // the register form authenticate
        passport.authenticate("local")(req, res, () => {
            res.redirect("/campgrounds");
        })
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "login"
    }), (req, res) => {
});

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/campgrounds");
});


//middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

module.exports = router;
