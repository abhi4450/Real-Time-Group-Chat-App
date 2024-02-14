const express = require("express");

const router = express.Router();

// const userAuth = require("../middleware/auth");
const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);
