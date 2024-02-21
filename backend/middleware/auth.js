const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserGroup = require("../models/UserGroup"); // Import the UserGroup model

const authenticateGroupAdmin = async (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const token = req.header("Authorization");
    console.log("Received token:", token);
    const decodedToken = jwt.verify(token, jwtSecret);
    const userId = decodedToken.userId;

    // Find the user by ID and include isAdmin status
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch the UserGroup entry for the user and the specified group
    const groupId = req.params.groupId; // Assuming you're passing groupId as a parameter
    const userGroup = await UserGroup.findOne({
      where: { userId, groupId },
    });

    if (!userGroup) {
      throw new Error("User is not a member of the specified group");
    }

    // Include the user's ID and isAdmin status in the req.user object
    req.user = {
      id: userId,
      isAdmin: userGroup.isAdmin,
    };
    console.log(
      "req.user.id,req.user.isAdmin::",
      req.user.id,
      req.user.isAdmin
    );
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};

// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

const authenticate = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const token = req.header("Authorization");
    console.log("recieved token :", token);
    const user = jwt.verify(token, jwtSecret);
    console.log("userId >>>>>>>>>>>>>>>>>", user.userId);
    User.findByPk(user.userId).then((user) => {
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "User not found", error: error });
  }
};

module.exports = {
  authenticateGroupAdmin,
  authenticate,
};
