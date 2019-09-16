const express = require("express");
var router = express.Router();
const client = require("./dbConnection");

const dbName = "ine5612";

router.get("/register", function(req, res) {
  //Este handler serve para registar um novo aluno.
  //Desta forma, passamos um objeto aluno vazio para
  //a view.
  res.render("register", {
    title: "Novo aluno",
    aluno: {},
    err: null
  });
});

router.get("/register/:matricula", function(req, res) {
  //Este handler serve para alterar um aluno, e recebe
  //a matrícula como parâmetro. É feita uma consulta no banco
  //e, caso não encontre aluno com essa matrícula, retorna
  //erro 404. Senão, retorna a view passando o aluno
  //encontrado
  client
    .db(dbName)
    .collection("alunos")
    .findOne({ matricula: req.params.matricula })
    .then(function(aluno) {
      if (!aluno) res.sendStatus(404);
      else
        res.render("register", {
          title: "Alterar aluno",
          aluno: aluno,
          err: null
        });
    });
});

router.post("/register/:matricula?", function(req, res) {
  //Este handler recebe um POST tanto de registro de novo
  //aluno como de alteração de um aluno existente. O ponto
  //de interrogação no parâmetro 'matricula' indica que esse
  //parâmetro não é obrigatório. Se o parâmetro não for recebido,
  //é feito um INSERT com os valores recebidos em req.body.
  //Se o parâmetro for recebido, é feito UPDATE no registro do
  //banco de dados (apenas o nome pode ser alterado). É importante
  //notar que, neste caso, não é recebido o número da matrícula
  //em req.body, apenas em req.params (veja a view, lá não é definido
  //um campo de matrícula quando é alteração de aluno).
  if (!req.params.matricula) {
    var matricula = req.body.matricula;
    var nome = req.body.nome;

    if (!nome || !matricula) {
      res.sendStatus(400);
      return;
    }

    client
      .db(dbName)
      .collection("alunos")
      .insertOne({ nome: nome, matricula: matricula }, (err, result) => {
        if (!err) {
          res.redirect("/");
        }
        if (err.code == 11000) {
          res.render("register", {
            title: "Alterar aluno",
            aluno: { nome: nome, matricula: "" },
            err: "Um aluno com essa matricula já foi cadastrado"
          });
        } else {
          res.render("register", {
            title: "Alterar aluno",
            aluno: { nome: nome, matricula: matricula },
            err: "Erro! Tente novamente"
          });
        }
      });
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
        }
      );
  }
});

router.get("/delete/:matricula", (req, res) => {
  client
    .db(dbName)
    .collection("alunos")
    .findOne({ matricula: req.params.matricula })
    .then(function(aluno) {
      if (!aluno) {
        res.sendStatus(404);
      } else {
        res.render("deleteStudent", {
          title: "Excluir aluno",
          aluno: aluno
        });
      }
    });
});

router.post("/delete/:matricula", function(req, res) {
  client
    .db(dbName)
    .collection("alunos")
    .deleteOne({ matricula: req.params.matricula });
  res.redirect("/");
});

module.exports = router;
