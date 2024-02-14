const path = require("path");
const rootDir = require("../util/path");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};
