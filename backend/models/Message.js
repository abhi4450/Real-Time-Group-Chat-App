const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const { v4: uuidv4 } = require("uuid");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => uuidv4(),
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

module.exports = Message;
