const express = require("express");

function viewEngineConfig(app) {
  app.set("views", "./src/views");
  app.set("view engine", "ejs");
  app.use(express.static("./src/public"));
}

module.exports = viewEngineConfig;
