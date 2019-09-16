const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://admin:admin@dso-trabalho-novkv.mongodb.net/test";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


module.exports = client;
