const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://admin:admin@dso-trabalho-novkv.mongodb.net/test";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const dbName = "ine5612";

function db() {
  return client.db(dbName);
}

function studentsCollection() {
  return db().collection("alunos");
}

function subjectCollection() {
  return db().collection("disciplina");
}

module.exports = client;

// module.exports = {
//   db: db(),
//   studentsCollection: studentsCollection(),
//   subjectCollection: subjectCollection()
// };
