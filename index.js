const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const studentController = require("./controllers/student");

var app = express();
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.urlencoded());

const client = require("./controllers/dbConnection");

const port = 80;
const dbName = "ine5612";

app.get("/", function(req, res) {
  client
    .db(dbName)
    .collection("alunos")
    .find({})
    .toArray(function(err, alunos) {
      res.render("home", { title: "Home", lista: alunos });
    });
});

app.use("/aluno", studentController);

app.use("/disciplina", studentController);

client.connect(function(err, db) {
  app.listen(port, function() {
    console.log(`Server running on port ${port}! Press CTRL+C to close`);
  });
});
