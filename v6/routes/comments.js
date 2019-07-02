const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");


//new comments
router.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
    //finding campground by ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new.ejs", {campground: campground})
        }
    });
});

//create comments
router.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
//    lookup campgrounds using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
//          create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
//                    add username and id to comment
//                    comment.author.id comes comment model setup
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
//                    save comment
                    comment.save();
//              connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //    redirect to campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
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