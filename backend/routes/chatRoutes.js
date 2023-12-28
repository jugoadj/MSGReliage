const express = require("express");
const router = express.Router();
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatControllers");
const { checkUser } = require("../middleware/authMiddleware");


router.route("/").post(checkUser, accessChat);
router.route("/").get( checkUser,fetchChats);
router.route("/group").post(checkUser, createGroupChat);
router.route("/rename").put( checkUser,renameGroup);
router.route("/groupremove").put(checkUser, removeFromGroup);
router.route("/groupadd").put(checkUser, addToGroup);

module.exports = router;