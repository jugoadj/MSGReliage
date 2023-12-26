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
const { protect } = require("../middleware/authMiddleware");
const multer = require('multer');
const path = require('path');

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


router.route("/").post(protect, sendMessage);
router.route("/transfere").post(protect, transferMessage);
router.post("/upload", protect, upload.single('file'),  sendFiles); //upload.single('file') : permet de stocker l'image dans le dossier uploads

//quand on fais une requête post vers /api/message/upload on va appeler la fonction sendMessage mais 
//on va stocker limage en static et on va enregistrer le chemin de limage dans la base de données
router.route("/:chatId").get(protect, allMessages);
router.route("/:chatId/files").get(protect, fetchFiles);

router.route("/Supp/:chatId").get(protect, deleteAllMsgs);
router.route("/Supp/:chatId/:MsgId").get(protect, deleteOneMsg);

module.exports = router;