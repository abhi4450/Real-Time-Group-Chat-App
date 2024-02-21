const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const UserGroup = sequelize.define("userGroup", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = UserGroup;
