const path = require("path");
const rootDir = require("../util/path");

const Message = require("../models/Message");
const User = require("../models/User");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

exports.getAllMessages = async (req, res, next) => {
  try {
    // Fetch all messages from the database with associated user information
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      attributes: ["message"],
      order: [["createdAt", "ASC"]],
      raw: true,
    });
    // console.log("messages", messages);

    const transformedMessages = messages.map((message) => ({
      message: message.message,
      sender: message["user.name"],
    }));
    // console.log("transformed message", transformedMessages);

    res.status(200).json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
