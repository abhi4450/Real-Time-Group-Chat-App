const express = require("express");

const router = express.Router();

const userController = require("../controllers/users");
const { authenticateGroupAdmin, authenticate } = require("../middleware/auth");

router.get("/home", userController.getsignupform);
router.get("/getmessages", userController.getNewMessages);
router.get("/groups", authenticate, userController.fetchUserGroups);
router.get("/users", userController.getAllUsers);
router.get(
  "/groups/:groupId/members",
  authenticateGroupAdmin,
  userController.getGroupMembers
);

module.exports = router;
