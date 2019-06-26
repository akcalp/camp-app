const express = require("express");
const app = express();


app.get("/", (req, res) => {
    res.render("landing.ejs");
});

app.get("/campgrounds", (req, res) => {
    var campgrounds = [
        {name: "Eugiena Falls", image: "https://farm4.staticflickr.com/3273/2602356334_20fbb23543.jpg"},
        {name: "Niagara Falls", image: "https://farm9.staticflickr.com/8422/7842069486_c61e4c6025.jpg"},
        {name: "Thornbury", image: "https://farm4.staticflickr.com/3361/3576042205_cdaae278ee.jpg"}
    ];
    res.render("campgrounds.ejs",{campgrounds:campgrounds});
});


app.listen(3000, process.env.IP, () => {
    console.log("Server has started!");
});