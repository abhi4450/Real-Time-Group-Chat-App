const path = require("path");
const rootDir = require("../util/path");

const Message = require("../models/Message");
const User = require("../models/User");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

exports.getAllMessages = async (req, res, next) => {
  try {
    
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["name"], 
        },
      ],
      attributes: ["id", "message"], 
    });

    // Send the messages as a response
    res.status(200).json(messages);
  } catch (error) {
    // Handle errors
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
