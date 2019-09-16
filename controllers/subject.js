const express = require("express");
var router = express.Router();
const client = require("./dbConnection");
const dbName = "ine5612";

router.get("/register", (req, res) => {
  res.render("registerDisciplina", {
    title: "Registrar disciplina",
    subject: {},
    err: null
  });
});

router.get("/register/:codigo", (req, res) => {
  client
    .db(dbName)
    .collection("disciplinas")
    .findOne({ codigo: req.params.codigo })
    .then(subject => {
      if (!subject) res.sendStatus(404);
      else {
        res.render("registerDisciplina", {
          title: "Alterar disciplina",
          subject,
          err: null
        });
      }
    });
});

router.post("/register/:codigo?", function(req, res) {
  var codigo = req.body.codigo || req.params.codigo;
  var nome = req.body.nome;
  var duracao = req.body.duracao;
  var inicio = req.body.inicio;

  const {
    segunda,
    segundaValues,
    terca,
    tercaValues,
    quarta,
    quartaValues,
    quinta,
    quintaValues,
    sexta,
    sextaValues
  } = req.body;
  //verifica quantos creditos tem
  let counter = 0;
  if (segunda && segundaValues) {
    counter += segundaValues.length;
  }
  if (terca && tercaValues) {
    counter += tercaValues.length;
  }
  if (quarta && quartaValues) {
    counter += quartaValues.length;
  }
  if (quinta && quintaValues) {
    counter += quintaValues.length;
  }
  if (sexta && sextaValues) {
    counter += sextaValues.length;
  }

  console.log(counter);

  if (counter > 4) {
    res.render("registerDisciplina", {
      title: "Alterar disciplina",
      subject: { nome, codigo, duracao },
      err:
        "Erro! Cada disciplina pode ter no máximo 4 horários durante a semana"
    });
    return;
  }

  if (!req.params.codigo) {
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
