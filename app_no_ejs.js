const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.get("/", function (req, res) {
    var today = new Date();

    if (today.getDay() == 1 || today.getDay() == 0) {
        res.send("wowww week end");
    } else {
        res.send("yaya working");
    }
});

app.listen(3000, function () {
    console.log("listening on port 30000");
});