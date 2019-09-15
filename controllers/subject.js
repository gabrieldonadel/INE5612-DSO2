const express = require("express");
var router = express.Router();
const client = require("./dbConnection");
const dbName = "ine5612";

router.get("/register", (req, res) => {
  res.render("registerDisciplina", {
    title: "Registrar disciplina",
    subject: {}
  });
});

router.post("/register/:codigo?", function(req, res) {
  if (!req.params.codigo) {
    var codigo = req.body.codigo;
    var nome = req.body.nome;
    var duracao = req.body.duracao;
    var inicio = req.body.inicio;
    console.log(codigo, nome, duracao, inicio, req.body);
    if (!codigo || !nome) {
      console.log("aqui");
      res.sendStatus(400);
      return;
    }

    client
      .db(dbName)
      .collection("disciplinas")
      .insertOne({
        nome,
        codigo,
        horario: { horario_inicio: inicio, duracao_aula: duracao, dia: 2 }
      });
    res.redirect("/");
  } else {
    var nome = req.body.nome;
    var matricula = req.params.matricula;
    if (!nome) {
      //Se não recebemos um nome, retorna erro 400
      res.sendStatus(400);
      console.log("Nome não informado...");
      return;
    }

    //Realiza o UPDATE no banco.
    console.log("update...");
    client
      .db(dbName)
      .collection("alunos")
      .updateOne(
        {
          matricula: matricula
        },
        {
          $set: { nome: nome }
        },
        function(err, result) {
          if (err) {
            console.log(err);
            throw err;
          }
          res.redirect("/");
          return;
        }
      );
  }
});

module.exports = router;
