require("dotenv").config();
const express = require("express");
const connection = require("./config/database");
const { appConfig } = require("./config/appConfig.js");

const app = express();
const port = process.env.PORT || 8888;

appConfig(app);

(async () => {
  try {
    //using mongoose
    await connection();

    app.listen(port, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
      console.log(`Local: http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();


