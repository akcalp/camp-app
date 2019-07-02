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
            req.flash("error", err.message);
            return res.render("register.ejs");
        }
        // the register form authenticate
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome " + user.username + "!");
            res.redirect("/campgrounds");
        })
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

//handling login logic
router.post("/login", (req, res, next) => {
    passport.authenticate("local",
        {
            successRedirect: "/campgrounds",
            failureRedirect: "/login",
            failureFlash: true,
            successFlash: "Welcome back, " + req.body.username + "!"
        })(req, res);
});

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/campgrounds");
});


module.exports = router;
