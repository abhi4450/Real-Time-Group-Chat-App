require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const rootDir = require("./util/path");
const sequelize = require("./util/database");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");

app.use(cors({ origin: "*" }));
app.use(express.static(path.join(rootDir, "../frontend", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require("./models/User");
const Message = require("./models/Message");
const Group = require("./models/Group");
const UserGroup = require("./models/UserGroup");

User.hasMany(Message);
Message.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
Group.hasMany(Message);
Message.belongsTo(Group, { constraints: true, onDelete: "CASCADE" });
User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });
User.hasMany(Group, { foreignKey: "adminUserId" });

Group.belongsTo(User, { foreignKey: "adminUserId" });

app.use("/api", adminRoutes);
app.use("/api", userRoutes);
app.use("/api", (req, res) => {
  res.sendFile(path.join(rootDir, "../frontend", `/public/${req.url}`));
});

sequelize
  .sync()
  .then(() => {
    app.listen(3000, (req, res) => {
      console.log("server running on Port=3000");
    });
  })
  .catch((err) => console.log(err));
