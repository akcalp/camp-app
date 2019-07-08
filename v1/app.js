const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

var campgrounds = [
    {name: "Eugiena Falls", image: "https://farm4.staticflickr.com/3273/2602356334_20fbb23543.jpg"},
    {name: "Niagara Falls", image: "https://farm9.staticflickr.com/8422/7842069486_c61e4c6025.jpg"},
    {name: "Thornbury", image: "https://farm4.staticflickr.com/3361/3576042205_cdaae278ee.jpg"}
];


mongoose.connect("mongodb://localhost/camp_ground");
app.use(bodyParser.urlencoded({extended: true}));

//SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

Campground.create(
    {
        name: "Eugenia Falls",
        image: "https://farm4.staticflickr.com/3273/2602356334_20fbb23543.jpg"
    }, (err,campground) => {
        if (err){
            console.log(err);
        }
        else{
            console.log("Campground Created");
            console.log(campground);
        }
    });


app.get("/", (req, res) => {
    res.render("landing.ejs");
});

//shows all the campgrounds
app.get("/campgrounds", (req, res) => {
    res.render("campgrounds.ejs", {campgrounds: campgrounds});
});

//making new campground and pushing it into an array
app.post("/campgrounds", (req, res) => {
    const name = req.body.name;
    const image = req.body.image;
    const newCampground = {name: name, image: image};
    campgrounds.push(newCampground);
    res.redirect("/campgrounds");
});

//form for input
app.get("/campgrounds/new", (req, res) => {
    res.render("new.ejs");
});

app.listen(3000, process.env.IP, () => {
    console.log("Server has started!");
});