// 1. ARREGLO PARA RENDER (Si falla dotenv, no pasa nada)
try {
  require('dotenv').config();
} catch (e) {
  console.log("En Render no usamos .env, usamos variables de entorno.");
}

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); // Arreglo para listas dinámicas

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// 2. CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch(err => console.log(err));

// 3. ESQUEMAS
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const defaultItems = [
  new Item({ name: "¡Bienvenida a tu lista!" }),
  new Item({ name: "Dale al + para añadir" })
];

// 4. RUTA PRINCIPAL (DASHBOARD) - AQUÍ ESTABA EL FALLO
// Esta es la "puerta de entrada" que te faltaba
app.get("/", async function(req, res) {
  try {
    const foundLists = await List.find({});
    // Si no hay listas, creamos dos básicas
    if (foundLists.length === 0) {
      await new List({ name: "Personal", items: defaultItems }).save();
      await new List({ name: "Trabajo", items: defaultItems }).save();
      res.redirect("/");
    } else {
      // Mostramos el Dashboard
      res.render("list", { allLists: foundLists });
    }
  } catch (err) {
    console.log(err);
  }
});

// 5. RUTA PARA LISTAS NUEVAS (Ej: /clase, /gimnasio)
app.get("/:customListName", async function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({name: customListName});
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/"); // Volvemos al Dashboard para ver la nueva lista
    } else {
      res.redirect("/"); // Si ya existe, volvemos al dashboard
    }
  } catch (err) {
    console.log(err);
  }
});

// 6. AÑADIR TAREA
app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list; 

  const item = new Item({ name: itemName });

  const foundList = await List.findOne({name: listName});
  foundList.items.push(item);
  await foundList.save();
  res.redirect("/");
});

// 7. BORRAR TAREA
app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

let port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Servidor iniciado correctamente");
});