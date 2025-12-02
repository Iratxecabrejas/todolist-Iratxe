//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));

const uri = "mongodb://localhost:27017/todolistDB";
mongoose.connect(uri);
// this we will put in mongo
let items = [];
let workItems = [];

//let's create data model 
const Schema = mongoose.Schema;

const toDoListSchema = Schema({
  toDoListName: String,
  toDoItems: [String]
});

const itemSchema = { name: String };


// defining the model will create the collection "todolists" in mongo
const ToDoList = mongoose.model('ToDoList', toDoListSchema);
const Item = mongoose.model("Item", itemSchema);


//now we will create the list for every page we define
// if we add an task will mean a push into toDoItems array
// if we complete and mark a tast will mean a pull into toDoItems array

//Nos let's create 3 default items
let rememberToBreathe = new Item({
  name: "Breathe!"
});

let rememberToSmile = new Item({
  name: "Smile!"
});

let rememberToPositive = new Item({
  name: "Be positive!"
});

const defaultItems = [rememberToBreathe, rememberToPositive, rememberToSmile];


app.get("/", function (_, res) {


  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }
  const dayFormatted = new Date().toLocaleDateString("en-US", options);
  // Verificar si la colección está vacía
  // Verificar si la colección está vacía
  //Con esta versión, countDocuments({}) devolverá una Promesa que se resolverá
  // con el recuento de documentos en la colección.Si el recuento es 0,
  // entonces se insertarán los elementos por defecto.
  Item.countDocuments({}).then((count) => {
    // Si no hay documentos, insertamos los elementos por defecto
    if (count === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("yaii");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  })
    .catch((err) => {
      console.log(err);
    });

  Item.find({}).then((foundItems) => {
    res.render("todolist-templates", { listTitle: dayFormatted, items: foundItems });
  })
    .catch((err) => {
      console.log(err);
    });

});

app.post("/", function (req, res) {
  console.log(req.body)

  let item = req.body.newitem;
  let list = req.body.list;


  if (list === "Work") {
    workItems.push(item)
    res.redirect("/work")
  } else {
    //not add to mongo collection
    //items.push(item)

    //create new doc
    let newItemToAdd = new Item({
      name: item
    });


    //savi in Items collection
    newItemToAdd.save()
      .then(() => {
        console.log("Item successfully added.");
        res.redirect("/"); //redirect to home and see update inmediately
      })
      .catch(err => console.log(err));

  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.itemId;

  Item.findByIdAndRemove(itemId)
    .then(() => {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});



app.get("/work", function (req, res) {
  res.render("todolist-templates", { listTitle: "Work", items: workItems });
});

// app.post("/works", function (req, res) {
//   console.log(req.body)
//   console.log("Estoy en post Works")

//   let item = req.body.newitem;
//   workItems.push(item)
//   res.redirect("/work");

// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
