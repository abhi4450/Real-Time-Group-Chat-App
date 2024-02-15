const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

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

const generateUUID = () => {
  // Generate a v4 (random) UUID
  return uuid.v4();
};

exports.postUserMessage = async (req, res, next) => {
  const { message } = req.body;
  const id = generateUUID();

  const UserMessage = {
    id: id,
    message: message,
  };

  try {
    const userMsg = await req.user.createMessage(UserMessage);
    res
      .status(201)
      .json({
        success: true,
        message: "Message created successfully",
        userMsg,
      });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ success: false, error: "Failed to create message" });
  }
};
