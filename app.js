try {
    require('dotenv').config();
} catch (e) {
    console.log("En Render no hace falta dotenv, seguimos...");
}
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); // Para poner mayúsculas automáticas

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// --- 1. CONEXIÓN (Cumple: "Configuración de MongoDB Atlas") ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas - Listas Dinámicas"))
  .catch(err => console.log(err));

// --- 2. ESQUEMAS (Cumple: "Modificación del Código - Colecciones") ---

// Esquema para tareas sueltas
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

// Esquema para LISTAS (Cumple: "lists: Para almacenar listas personalizadas")
const listSchema = {
  name: String,
  items: [itemsSchema] // Cada lista guarda un array de tareas dentro
};
const List = mongoose.model("List", listSchema);

// Tareas por defecto (para que la lista no aparezca vacía al principio)
const defaultItems = [
  new Item({ name: "Comprar pan 🥖" }),
  new Item({ name: "Repasar apuntes 📚" }),
  new Item({ name: "Ir al gimnasio 💪" })
];


// --- 3. RUTAS (Cumple: "Mostrar tareas" y "Añadir tareas") ---

// Si entran en la raíz (/), les llevamos a la lista "General" automáticamente
app.get("/", function(req, res) {
    res.redirect("/TareasIratxe");
});

// RUTA PRINCIPAL (DASHBOARD) - Muestra TODAS las listas
app.get("/", async function(req, res) {
  try {
    // 1. Buscamos todas las listas que existan en la base de datos
    const foundLists = await List.find({});

    // 2. Si no hay ninguna (está vacío), creamos dos por defecto para que no se vea feo
    if (foundLists.length === 0) {
      const list1 = new List({ name: "Personal", items: defaultItems });
      const list2 = new List({ name: "Trabajo", items: defaultItems });
      await list1.save();
      await list2.save();
      res.redirect("/"); // Recargamos para que aparezcan
    } else {
      // 3. Si hay listas, las enviamos TODAS a la vista
      res.render("list", { allLists: foundLists });
    }
  } catch (err) {
    console.log(err);
  }
});

// AÑADIR TAREA (POST)
app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list; // El botón nos dice en qué lista estamos

  const item = new Item({ name: itemName });

  // Buscamos la lista correcta y guardamos la tarea DENTRO de ella
  const foundList = await List.findOne({name: listName});
  foundList.items.push(item);
  await foundList.save();
  
  // Recargamos la página de esa lista específica
  res.redirect("/" + listName);
});

// ELIMINAR TAREA (Cumple: "Eliminar tareas específicas")
app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; // Necesitamos saber de qué lista borrar

  try {
    // Usamos $pull para sacar la tarea del array de esa lista
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
    res.redirect("/" + listName);
  } catch (err) {
    console.log(err);
  }
});

let port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Servidor iniciado correctamente");
});