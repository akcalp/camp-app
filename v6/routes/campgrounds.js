const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");


// index route
router.get("/campgrounds", (req, res) => {
    //Getting all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index.ejs", {campgrounds: allCampgrounds});
        }
    });
});

//CREATE - adding new campground to DB
router.post("/campgrounds", isLoggedIn, (req, res) => {
    //body.name-image-description all comes from input name
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    };

    const newCampground = {name: name, image: image, description: desc, author: author};

    //Create a new campground and save to DB
    Campground.create(newCampground, (err, newCreated) => {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds
            res.redirect("/campgrounds");
        }
    });
});

// NEW - show form to create campground
router.get("/campgrounds/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new.ejs");
});

// SHOW - shows more info about a campground
router.get("/campgrounds/:id", (req, res) => {
    //find the campground with the ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show.ejs", {campground: foundCampground});
        }
    });
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
