const path = require("path");
const rootDir = require("../util/path");

const Message = require("../models/Message");
const User = require("../models/User");

exports.getsignupform = (req, res, next) => {
  res.sendFile(path.join(rootDir, "../frontend", "public", "signup.html"));
};

exports.getNewMessages = async (req, res, next) => {
  try {
    const { timestamp } = req.query;

    // Fetch new messages from the database with associated user information
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      where: {
        createdAt: { [Op.gt]: new Date(parseInt(timestamp)) }, // Fetch messages created after the provided timestamp
      },
      attributes: ["message"],
      order: [["createdAt", "ASC"]],
      raw: true,
    });

    const transformedMessages = messages.map((message) => ({
      message: message.message,
      sender: message["user.name"],
    }));

    res.status(200).json(transformedMessages);
  } catch (error) {
    console.error("Error fetching new messages:", error);
    res.status(500).json({ error: "Failed to fetch new messages" });
  }
};
