const path = require("path");
const rootDir = require("../util/path");

const Message = require("../models/Message");
const User = require("../models/User");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

const { Op } = require("sequelize");

exports.getNewMessages = async (req, res, next) => {
  try {
    const { lastMessageId } = req.query;
    let messages;

    if (lastMessageId) {
      // Fetch messages with IDs greater than the last message ID
      messages = await Message.findAll({
        where: {
          id: { [Op.gt]: lastMessageId },
        },
        include: [
          {
            model: User,
            attributes: ["name"],
          },
        ],
        attributes: ["id", "message"],
        order: [["createdAt", "ASC"]],
        raw: true,
      });
    } else {
      messages = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ["name"],
          },
        ],
        attributes: ["id", "message"],
        order: [["createdAt", "ASC"]],
        raw: true,
      });
    }

    messages = messages.map((message) => ({
      id: message.id,
      message: message.message,
      sender: message["user.name"],
    }));
    console.log("new message : ", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
