const express = require("express");
const {
  allMessages,
  sendMessage,
  sendFiles,
  fetchFiles,
  transferMessage,
  deleteAllMsgs,
  deleteOneMsg,
} = require("../controllers/messageControllers");
const multer = require('multer');
const path = require('path');
const { checkUser } = require("../middleware/authMiddleware");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname )
  }
})

const upload = multer({ storage: storage });
const router = express.Router();


router.route("/").post(checkUser, sendMessage);
router.route("/transfere").post(checkUser, transferMessage);
router.post("/upload",checkUser, upload.single('file'),  sendFiles); //upload.single('file') : permet de stocker l'image dans le dossier uploads

//quand on fais une requête post vers /api/message/upload on va appeler la fonction sendMessage mais 
//on va stocker limage en static et on va enregistrer le chemin de limage dans la base de données
router.route("/:chatId").get(checkUser, allMessages);
router.route("/:chatId/files").get(checkUser, fetchFiles);

router.route("/Supp/:chatId").delete(checkUser, deleteAllMsgs);
router.route("/Supp/:MsgId").get(checkUser, deleteOneMsg);

module.exports = router;