const express = require("express");

const router = express.Router();
const userAuth = require("../middleware/auth");

const adminController = require("../controllers/admin");

router.post("/user/signup", adminController.signupUser);
router.post("/user/login", adminController.loginValidUser);
router.post(
  "/user/message",
  userAuth.authenticate,
  adminController.postUserMessage
);

router.post(
  "/user/createGroup",
  userAuth.authenticate,
  adminController.postCreateGroup
);

router.delete(
  "/admin/:groupId/remove/:userId",
  adminController.removeUserFromGroup
);
router.delete("/admin/delete/:groupId", adminController.deleteGroup);

module.exports = router;
