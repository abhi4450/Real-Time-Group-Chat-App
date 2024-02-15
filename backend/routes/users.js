const express = require("express");

const router = express.Router();

const userController = require("../controllers/users");

router.get("/home", userController.getsignupform);
router.get("/getmessages", userController.getAllMessages);

module.exports = router;
