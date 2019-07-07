const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Campground = require("../models/campground");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const mongoose = require('mongoose'); mongoose.set('useCreateIndex', true);

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
    const newUser = new User(
        {
            username: req.body.username,
            fullName: req.body.fullName,
            email: req.body.email,
            avatar: req.body.avatar,
        });
    if (req.body.adminKey === "secret123") {
        newUser.isAdmin = true;
    }
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

//forgot password
router.get("/forgot", (req, res, next) => {
    res.render("forgot.ejs");
});


router.post("/forgot", (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({email: req.body.email}, (err, user) => {
                if (!user) {
                    req.flash("error", "No account with that email address");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour in ms

                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            const smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "wtfalpftw@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: "wtfalpftw@gmail.com",
                subject: "Password reset",
                text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda, vero." +
                    "Click the following link to reset your pass word" +
                    "http://" + req.header.host + "/reset/" + token + "\n\n"
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                console.log("mail sent");
                req.flash("success", "An e-mail has been sent to " + user.email + " with instructions");
                done(err, "done");
            });
        }
    ], (err) => {
        if (err) {
            return next(err);
        } else {
            res.redirect("/forgot");
        }
    });
});

//this opens up when user click on a link from their mail with the token
router.get("/reset/:token", (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
        if (!user) {
            req.flash("error", "Token is invalid or has expired");
            return res.redirect("/forgot");
        }
        res.render("reset.ejs", {token: req.params.token})
    });
});

//enter and confirm new password
router.post('/reset/:token', function (req, res) {
    //array of functions that can called in sequence
    async.waterfall([
        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save((err) => {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        (user, done) => {
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'wtfalpftw@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'wtfalpftw@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], (err) => {
        res.redirect('/campgrounds');
    });
});


//User profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash("error", "Something went wrong..");
            return res.redirect("/");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds) => {
            if (err) {
                req.flash("error", "Something went wrong..");
                return res.redirect("/");
            }
            res.render("users/show.ejs", {user: foundUser, campgrounds: campgrounds});
        });
    })
});


module.exports = router;
