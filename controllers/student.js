const express = require("express");
var router = express.Router();
const client = require("./dbConnection");

const dbName = "ine5612";

async function getSubjects() {
  return new Promise(function(resolve, reject) {
    client
      .db(dbName)
      .collection("disciplinas")
      .find({})
      .toArray((err, subjects) => {
        console.log(subjects);
        if (err) {
          return reject(err);
        }
        return resolve(subjects);
      });
  });
}

async function getStudent(matricula) {
  return (
    (await client
      .db(dbName)
      .collection("alunos")
      .findOne({ matricula })
      .then(aluno => aluno)) || {}
  );
}

router.get("/register", async function(req, res) {
  //Este handler serve para registar um novo aluno.
  //Desta forma, passamos um objeto aluno vazio para
  //a view.
  const subjects = await getSubjects();

  client
    .db(dbName)
    .collection("disciplinas")
    .find({})
    .toArray((err, subjects) => {
      res.render("register", {
        title: "Novo aluno",
        aluno: {},
        err: null,
        subjects
      });
    });
});

router.get("/register/:matricula", async (req, res) => {
  //Este handler serve para alterar um aluno, e recebe
  //a matrícula como parâmetro. É feita uma consulta no banco
  //e, caso não encontre aluno com essa matrícula, retorna
  //erro 404. Senão, retorna a view passando o aluno
  //encontrado
  try {
    let subjects = await getSubjects();
    let student = await getStudent(req.params.matricula);

    const orderedSubjects = subjects.map(subject => {
      if (
        student.disciplinas &&
        student.disciplinas.find(disciplina => disciplina == subject.codigo)
      ) {
        return { ...subject, selected: true };
      } else {
        return subject;
      }
    });

    console.log(orderedSubjects, subjects, student);

    if (!student) res.sendStatus(404);
    else {
      res.render("register", {
        title: "Alterar aluno",
        aluno: student,
        err: null,
        subjects: orderedSubjects
      });
    }
  } catch (err) {
    console.log("erro", err);
  }
});

function newStudent(nome, matricula, disciplinas, res) {
  client
    .db(dbName)
    .collection("alunos")
    .insertOne(
      {
        nome,
        matricula,
        disciplinas
      },
      (err, result) => {
        console.log("update aaaa", err);
        if (!err) {
          res.redirect("/");
        }
        client
          .db(dbName)
          .collection("disciplinas")
          .find({})
          .toArray((err, subjects) => {
            if (err && err.code == 11000) {
              res.render("register", {
                title: "Alterar aluno",
                aluno: { nome: nome, matricula: "" },
                err: "Um aluno com essa matricula já foi cadastrado",
                subjects
              });
            } else {
              res.render("register", {
                title: "Alterar aluno",
                aluno: { nome: nome, matricula: matricula },
                err: "Erro! Tente novamente"
              });
            }
          });
      }
    );
}

function updateStudent(nome, matricula, disciplinas, res) {
  client
    .db(dbName)
    .collection("alunos")
    .updateOne(
      {
        matricula
      },
      {
        $set: { nome, disciplinas }
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

router.post("/register/:matricula?", function(req, res) {
  console.log(req.body);

  const matricula = req.body.matricula || req.params.matricula;
  const nome = req.body.nome;
  const disciplinas = req.body.disciplinas || [];

  if (!req.params.matricula) {
    if (!nome || !matricula) {
      res.sendStatus(400);
      return;
    }

    newStudent(nome, matricula, disciplinas, res);
  } else {
    if (!nome) {
      //Se não recebemos um nome, retorna erro 400
      res.sendStatus(400);
      console.log("Nome não informado...");
      return;
    }

    //Realiza o UPDATE no banco.
    console.log(matricula);
    console.log("update...", matricula);

    updateStudent(nome, matricula, disciplinas, res);
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
