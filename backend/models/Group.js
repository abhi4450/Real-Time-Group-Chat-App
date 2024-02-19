const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Group = sequelize.define("group", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  adminUserId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Group;
