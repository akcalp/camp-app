//Middleware
const Campground = require("../models/campground");
const Comment = require("../models/comment");


const middlewareObj = {};

//checking if user owns the post
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    //is logged in
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash("error","Campground not found!");
                res.redirect("back")
            } else {
                //does user own the post
                //.equals because author.id is a mongoose object and user.id is string
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error","You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        //if not redirect
        req.flash("error","You need to be logged in to do that!");
        res.redirect("back");
    }
};


//check if user owns the comment
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash("error","Comment not found!");
                res.redirect("back");
            } else {
                //does user own the comment
                //.equals because author.id is a mongoose object and user.id is string
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error","You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error","You need to be logged in to do that!");
        //if not redirect
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error","You need to be logged in to do that!");
    res.redirect("/login");

};


module.exports = middlewareObj;