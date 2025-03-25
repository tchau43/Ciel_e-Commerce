require("dotenv").config();
const express = require("express");
const viewEngineConfig = require("./config/viewEngineConfig.js");
const apiRoutes = require("./routes/api.js");
// const { getHomePage } = require('./controllers/homeController.js');
const cors = require("cors");
const connection = require("./config/database");

const app = express();
const port = process.env.PORT || 8888;

app.use(express.static("./src/public"));
//config cors
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// viewEngineConfig(app);

app.use("/v1/", apiRoutes);

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
