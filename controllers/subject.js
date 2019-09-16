const express = require("express");
var router = express.Router();
const client = require("./dbConnection");
const dbName = "ine5612";

router.get("/register", (req, res) => {
  res.render("registerDisciplina", {
    title: "Registrar disciplina",
    subject: {
      horario: [
        new Array(4).fill(false),
        new Array(4).fill(false),
        new Array(4).fill(false),
        new Array(4).fill(false),
        new Array(4).fill(false)
      ]
    },
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
        console.log(subject);
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

  var horario = [
    new Array(4).fill(false),
    new Array(4).fill(false),
    new Array(4).fill(false),
    new Array(4).fill(false),
    new Array(4).fill(false)
  ];

  const {
    segundaValues,
    tercaValues,
    quartaValues,
    quintaValues,
    sextaValues
  } = req.body;
  //verifica quantos creditos tem
  let counter = 0;
  if (segundaValues) {
    counter += segundaValues.length;
    (segundaValues || []).forEach(value => {
      horario[0][parseInt(value) - 1] = true;
    });
  }
  if (tercaValues) {
    counter += tercaValues.length;
    (tercaValues || []).forEach(value => {
      horario[1][parseInt(value) - 1] = true;
    });
  }
  if (quartaValues) {
    counter += quartaValues.length;
    (quartaValues || []).forEach(value => {
      horario[2][parseInt(value) - 1] = true;
    });
  }
  if (quintaValues) {
    counter += quintaValues.length;
    (quintaValues || []).forEach(value => {
      horario[3][parseInt(value) - 1] = true;
    });
  }
  if (sextaValues) {
    counter += sextaValues.length;
    (sextaValues || []).forEach(value => {
      horario[4][parseInt(value) - 1] = true;
    });
  }

  console.log(counter, horario);

  if (counter > 4) {
    res.render("registerDisciplina", {
      title: "Alterar disciplina",
      subject: { nome, codigo, duracao, horario },
      err:
        "Erro! Cada disciplina pode ter no máximo 4 horários durante a semana"
    });
    return;
  } else if (counter == 0) {
    res.render("registerDisciplina", {
      title: "Alterar disciplina",
      subject: { nome, codigo: "", duracao, horario },
      err: "Erro! Selecione os horarios para a disciplina"
    });
  }

  if (!req.params.codigo) {
    console.log(codigo, nome, duracao, inicio, req.body);

    if (!codigo || !nome) {
      console.log("aqui");
      res.render("registerDisciplina", {
        title: "Alterar disciplina",
        subject: { nome, codigo: "", duracao, horario },
        err: "Erro! Preencha todos os campos"
      });
      return;
    }

    client
      .db(dbName)
      .collection("disciplinas")
      .insertOne(
        {
          nome,
          codigo,
          horario: horario //{ horario_inicio: inicio, duracao_aula: duracao, dia: 2 }
        },
        (err, result) => {
          if (!err) {
            res.redirect("/");
          }
          if (err && err.code == 11000) {
            res.render("registerDisciplina", {
              title: "Alterar disciplina",
              subject: { nome, codigo: "", duracao, horario },
              err: "Uma disciplina com este codigo já foi cadastrada"
            });
          } else {
            res.render("registerDisciplina", {
              title: "Alterar disciplina",
              subject: { nome, codigo: "", duracao, horario },
              err: "Erro! Tente novamente"
            });
          }
        }
      );
  } else {
    if (!nome) {
      //Se não recebemos um nome, retorna erro 400
      res.sendStatus(400);
      console.log("Nome não informado...");
      return;
    }

    //Realiza o UPDATE no banco.
    console.log("update...");
    console.log(horario);
    client
      .db(dbName)
      .collection("disciplinas")
      .updateOne(
        {
          codigo
        },
        {
          $set: { nome, horario }
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

router.get("/delete/:codigo", (req, res) => {
  client
    .db(dbName)
    .collection("disciplinas")
    .findOne({ codigo: req.params.codigo })
    .then(subject => {
      if (!subject) {
        res.sendStatus(404);
      } else {
        res.render("deleteSubject", {
          title: "Excluir aluno",
          subject
        });
      }
    });
});

router.post("/delete/:codigo", function(req, res) {
  client
    .db(dbName)
    .collection("disciplinas")
    .deleteOne({ codigo: req.params.codigo });
  res.redirect("/");
});

module.exports = router;
