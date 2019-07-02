const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");


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
router.post("/campgrounds", middleware.isLoggedIn, (req, res) => {
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
router.get("/campgrounds/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new.ejs");
});

// SHOW - shows more info about a campground
router.get("/campgrounds/:id", (req, res) => {
    //find the campground with the ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error","Campground not found");
            res.redirect("back")
        } else {
            //render show template with that campground
            res.render("campgrounds/show.ejs", {campground: foundCampground});
        }
    });
});


//Edit campground route
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit.ejs", {campground: foundCampground});
    });
});

//Update campground route
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership,(req, res) => {
//    find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
//          redirect(show page)
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
});

//Destroy campground
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership ,(req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err,campgroundRemoved) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
});





module.exports = router;
