require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const rootDir = require("./util/path");
const sequelize = require("./util/database");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.static(path.join(rootDir, "../frontend", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require("./models/User");
const Message = require("./models/Message");
const Group = require("./models/Group");
const UserGroup = require("./models/UserGroup");

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, {
  through: UserGroup,
  onDelete: "CASCADE",
});

User.hasMany(Message);
Message.belongsTo(User);
Group.hasMany(Message);
Message.belongsTo(Group, { constraints: true, onDelete: "CASCADE" });

app.use("/api", adminRoutes);
app.use("/api", userRoutes);
app.use("/api", (req, res) => {
  res.sendFile(path.join(rootDir, "../frontend", `/public/${req.url}`));
});

io.on("connection", (socket) => {
  console.log(`A user connected with socket id ${socket.id}`);
  socket.on("send-message", (message) => {
    socket.broadcast.emit("receive-message", message);
    console.log(message);
  });
  // socket.on("join-room", (currentGroupId) => {
  //   console.log("joined group");
  //   socket.broadcast.emit("show-message", currentGroupId);
  // });
});

sequelize
  .sync()
  .then(() => {
    http.listen(3000, () => {
      console.log("Server running on Port:3000");
    });
  })
  .catch((err) => console.error("Error syncing database:", err));
