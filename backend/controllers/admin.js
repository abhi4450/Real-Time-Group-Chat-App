const User = require("../models/User");

const bcrypt = require("bcrypt");

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
    // Check if the error is due to duplicate email
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
