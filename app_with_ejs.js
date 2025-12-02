const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    var today = new Date();
    var day = "";
    var nombreDia = "";


    if (today.getDay() == 1 || today.getDay() == 0) {
        day = "weekend";
    } else {
        day = "weekday";
    }
    console.log("el dia " + today.getDay());
    switch (today.getDay()) {
        case 0:
            nombreDia = "Domingo";
            break;
        case 1:
            nombreDia = "Lunes";
            break;
        case 2:
            nombreDia = "Martes";
            break;
        case 3:
            nombreDia = "Miercoles";
            break;
        case 4:
            nombreDia = "Jueves";
            break;
        case 5:
            nombreDia = "Viernes";
            break;
        case 6:
            nombreDia = "Sabado";
            break;
        default:
            console.log("nombre..." + nombreDia);
    }


    res.render("list", { day, today, nombreDia });
});

app.listen(3000, function () {
    console.log("listening on port 30000");
});