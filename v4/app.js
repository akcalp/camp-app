const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds");


mongoose.connect("mongodb://localhost:27017/camp_ground", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
seedDB();


app.get("/", (req, res) => {
    res.render("landing.ejs");
});

//INDEX - show all campgrounds
app.get("/campgrounds", (req, res) => {
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
app.post("/campgrounds", (req, res) => {
    //body.name-image-description all comes from input name
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    const newCampground = {name: name, image: image, description: desc};
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
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new.ejs");
});

// SHOW - shows more info about a campground
app.get("/campgrounds/:id", (req, res) => {
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

//***********************************
//      COMMENT ROUTES
//***********************************
app.get("/campgrounds/:id/comments/new", (req, res) => {
    //finding campground by ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new.ejs", {campground: campground})
        }
    });
});

app.post("/campgrounds/:id/comments", (req, res) => {
//    lookup campgrounds using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
//          create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err){
                    console.log(err);
                } else{
//              connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //    redirect to campground show page
                    res.redirect("/campgrounds/"+ campground._id);
                }
            });



        }
    });

});


app.listen(3000, process.env.IP, () => {
    console.log("Server has started!");
});