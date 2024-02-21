const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");
const UserGroup = require("../models/UserGroup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signupUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneno } = req.body;

    // Hashing the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = { name, email, phoneno, password: hashedPassword };

    const newUser = await User.create(userDetails);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    // Checks if the error is due to duplicate email or duplicate phone no.
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Either Email Or Phoneno already exists, Please Login",
      });
    }

    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//function to generateAccessToken
function generateAccessToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign({ userId }, jwtSecret);
}

exports.loginValidUser = async (req, res, next) => {
  try {
    const loginUserData = req.body;
    const user = await User.findOne({
      where: {
        email: loginUserData.email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    // Comparing the hashed password
    const passwordMatch = await bcrypt.compare(
      loginUserData.password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email is valid but incorrect password",
      });
    }
    const token = generateAccessToken(user.id);

    return res.status(200).json({
      message: "User Logged In Successfully.",
      token: token,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.postUserMessage = async (req, res, next) => {
  const { groupId, message } = req.body; // Include groupId from request body

  console.log("groupId----------------->", groupId);

  const UserMessage = {
    message: message,
    groupId: groupId, // Associate the message with the specified group
  };

  try {
    const userMsg = await req.user.createMessage(UserMessage);
    console.log("userMsg:::::::::", userMsg);
    res.status(201).json({
      success: true,
      message: "Message created successfully",
      userMsg,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ success: false, error: "Failed to create message" });
  }
};

exports.postCreateGroup = async (req, res, next) => {
  const { groupName, selectedUsers } = req.body;
  const userId = req.user.id;

  try {
    // Check if the group name already exists
    const existingGroup = await Group.findOne({ where: { name: groupName } });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    // Create the group
    const newGroup = await Group.create({ name: groupName });

    // Add the user who created the group as an admin
    await UserGroup.create({ userId, groupId: newGroup.id, isAdmin: true });

    // Add selected users to the group
    if (selectedUsers && selectedUsers.length > 0) {
      for (const selectedUserId of selectedUsers) {
        // Check if the user is already a member of the group
        const isMember = await UserGroup.findOne({
          where: { userId: selectedUserId, groupId: newGroup.id },
        });
        if (!isMember) {
          await UserGroup.create({
            userId: selectedUserId,
            groupId: newGroup.id,
          });
        }
      }
    }

    return res.status(201).json({ group: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
};

exports.removeUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.params;
  console.log("user to be removed::::::::::", userId);
  try {
    // Check if the user is a member of the group
    const userGroup = await UserGroup.findOne({ where: { groupId, userId } });
    if (!userGroup) {
      return res
        .status(404)
        .json({ message: "User is not a member of the group" });
    }

    // Remove the user from the group
    await userGroup.destroy();

    res
      .status(200)
      .json({ message: "User removed from the group successfully" });
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Find the group by ID
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete the group
    await group.destroy();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
