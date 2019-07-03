const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");


//new comments
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, (req, res) => {
    //finding campground by ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err || !campground) {
            req.flash("error","Campground not found");
            res.redirect("back")
        } else {
            res.render("comments/new.ejs", {campground: campground})
        }
    });
});

//create comments
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, (req, res) => {
//    lookup campgrounds using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
//          create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong");
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
                    req.flash("success", "Comment successfully added!");
                    //    redirect to campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});
//Comment Edit route
//comment_id should match with action in form
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found!")
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit.ejs", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//Comment Update route
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//Comment Destroy route
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});


module.exports = router;