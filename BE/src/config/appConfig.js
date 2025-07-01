const express = require("express");
const cors = require("cors");
const apiRoutes = require("../routes/api");
const path = require("path");

const appConfig = (app) => {
  app.use(express.static(path.join(__dirname, "../public/")));
  app.use(
    cors({
      origin: "*",
      allowedHeaders: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/v1/", apiRoutes);
};

module.exports = { appConfig };
