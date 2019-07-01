const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/camp_ground", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));

//SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "Niagara Falls",
//         image: "https://farm9.staticflickr.com/8422/7842069486_c61e4c6025.jpg",
//         description: "Largest, and most powerful water fall in the world"
//     }, (err, campground) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("Campground Created");
//             console.log(campground);
//         }
//     });


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
            res.render("index.ejs", {campgrounds: allCampgrounds});
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
    res.render("new.ejs");
});

// SHOW - shows more info about a campground
app.get("/campgrounds/:id", (req, res) => {
    //find the campground with the ID
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err){
            console.log(err);
        }else{
            //render show template with that campground
            res.render("show.ejs",{campground: foundCampground});
        }
    });

});


app.listen(3000, process.env.IP, () => {
    console.log("Server has started!");
});