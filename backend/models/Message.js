const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

module.exports = Message;
