const path = require("path");
const rootDir = require("../util/path");

const Message = require("../models/Message");
const User = require("../models/User");
const Group = require("../models/Group");
const UserGroup = require("../models/UserGroup");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

const { Op } = require("sequelize");

exports.getNewMessages = async (req, res, next) => {
  try {
    const { lastMessageId, groupId } = req.query;
    let messages;

    const whereOptions = {};
    if (lastMessageId) {
      // Fetch messages with IDs greater than the last message ID
      whereOptions.id = { [Op.gt]: lastMessageId };
    }
    if (groupId) {
      whereOptions.groupId = groupId;
    }

    messages = await Message.findAll({
      where: whereOptions,
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      attributes: ["id", "message", "groupId"],
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    messages = messages.map((message) => ({
      id: message.id,
      message: message.message,
      sender: message["user.name"],
      groupId: groupId,
    }));
    console.log("new message:;;;;;;;;;;;;;", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name"], // Fetch only the name attribute
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group by groupId including associated users and their isAdmin status
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          through: {
            model: UserGroup,
            attributes: ["isAdmin"],
          },
        },
      ],
    });

    // Check if the group exists
    if (!group) {
      console.log(`Group with ID ${groupId} not found`);
      return res.status(404).json({ message: "Group not found" });
    }

    // Prepare the response data with isAdmin information
    const members = group.users.map((user) => ({
      id: user ? user.id : null,
      name: user ? user.name : null,

      isAdmin: user.userGroup ? user.userGroup.isAdmin : null,

      groupId: groupId,
    }));
    console.log("req.user.isAdmin::::::::::", req.user.isAdmin);
    return res
      .status(200)
      .json({ members, isCurrentUserAdmin: req.user.isAdmin });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.fetchUserGroups = async (req, res) => {
  try {
    // Find group IDs associated with the logged-in user
    console.log("req.user>>>>>>>>", req.user.id);
    const userGroups = await UserGroup.findAll({
      where: { userId: req.user.id },
      attributes: ["groupId"], // Only select the group IDs
    });

    // Extract group IDs from the fetched records
    const groupIds = userGroups.map((userGroup) => userGroup.groupId);

    // Find groups using the extracted group IDs
    const groups = await Group.findAll({
      where: { id: groupIds }, // Filter by group IDs associated with the user
      attributes: ["id", "name"], // Select only the 'id' and 'name' attributes
      order: [["createdAt", "ASC"]],
    });

    // Send the response with the groups
    res.status(200).json({ groups });
  } catch (error) {
    // Handle errors
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
