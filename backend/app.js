require("dotenv").config();

const express = require("express");
const app = express();

const sequelize = require("./util/database");

sequelize
  .sync()
  .then(() => {
    app.listen(3000, (req, res) => {
      console.log("server running on Port=3000");
    });
  })
  .catch((err) => console.log(err));
