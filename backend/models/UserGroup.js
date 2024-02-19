const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const UserGroup = sequelize.define("userGroup", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
});

module.exports = UserGroup;
