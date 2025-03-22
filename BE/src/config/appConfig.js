const express = require("express");
const cors = require("cors");
const apiRoutes = require("../routes/api");
const path = require("path")

const appConfig = (app) => {
    // app.use(express.static("./src/public"));
    app.use(express.static(path.join(__dirname, '../public/')));
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use("/v1/", apiRoutes);
}

module.exports = { appConfig }