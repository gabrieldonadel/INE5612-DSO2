const express = require("express");
var router = express.Router();

router.get("/register", (req, res) => {
  res.render("registerDisciplina", {
    title: "Registrar disciplina"
  });
});

module.exports = router;
