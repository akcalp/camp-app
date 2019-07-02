//Middleware
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middlewareObj = {};


middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    //is logged in
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                res.redirect("back")
            } else {
                //does user own the post
                //.equals because author.id is a mongoose object and user.id is string
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        //if not redirect
        res.redirect("back");
    }
};


middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back")
            } else {
                //does user own the comment
                //.equals because author.id is a mongoose object and user.id is string
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        //if not redirect
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
};


module.exports = middlewareObj;