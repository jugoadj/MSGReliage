const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");


//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {  //détails du message.
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage); // crée un nouveau message dans la base de données.

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });// on met à jour le dernier message du chat dans la base de données.

    res.json(message); //envoyer le message créé en réponse à la requête HTTP.
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })//  rechercher dans la base de données tous les messages qui ont un champ chat égal à req.params.chatId, qui est l'ID du chat passé dans l'URL de la requête.
      .populate("sender", "name pic email") // remplace le champ sender (qui est un ID de l'utilisateur) par les détails de l'utilisateur correspondant (nom, image et email).
      .populate("chat");
    res.json(messages);//envoyer les messages du chat récupérés en réponse à la requête HTTP.
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
module.exports = { allMessages, sendMessage };