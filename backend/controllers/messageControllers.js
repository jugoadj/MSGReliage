const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const UserModel = require("../models/userModel");
const Chat = require("../models/chatModel");


const transferMessage = async (req, res) => {
  const {messageId, chatId} = req.body;

  if (!messageId || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: res.locals.user._id, 
    chat: chatId,
    content: messageId.content,
  };

  try {
    var message = await Message.create(newMessage); // crée un nouveau message dans la base de données 

    message = await message.populate("sender", "name pic"); // peuple le champ sender (qui est un ID de l'utilisateur) avec les détails de l'utilisateur correspondant (nom et image).
    message = await message.populate("chat"); // peuple le champ chat (qui est un ID du chat) avec les détails du chat correspondant (nom et image).
    message = await UserModel.populate(message, {// peuple le champ chat.users (qui est un tableau d'ID d'utilisateurs) avec les détails des utilisateurs correspondants (nom, image et email). 
      path: "chat.users", 
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message } );// on met à jour le dernier message du chat dans la base de données.
    

    res.json(message); //envoyer le message créé en réponse à la requête HTTP.
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
  

};


const sendFiles = asyncHandler(async (req, res) => {
  const { file } = req;
  const { chatId } = req.body;
  if (!file ) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  var newMessage = {
    sender: res.locals.user._id, 
    chat: chatId,
    file: file.path, // Le chemin du fichier téléchargé
  };
  console.log(chatId);
  try {
    var message = await Message.create(newMessage); // crée un nouveau message dans la base de données 
    console.log("fichier enregistere dans la base de donnees");
    message = await message.populate("sender", "name pic"); // peuple le champ sender (qui est un ID de l'utilisateur) avec les détails de l'utilisateur correspondant (nom et image).
    message = await message.populate("chat"); // peuple le champ chat (qui est un ID du chat) avec les détails du chat correspondant (nom et image).
    message = await UserModel.populate(message, {// peuple le champ chat.users (qui est un tableau d'ID d'utilisateurs) avec les détails des utilisateurs correspondants (nom, image et email). 
      path: "chat.users", 
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });// on met à jour le dernier message du chat dans la base de données.

    res.json(message); //envoyer le message créé en réponse à la requête HTTP.
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});




const fetchFiles = asyncHandler(async (req, res) => {    
  try { 
    const messages = await Message.find({ chat: req.params.chatId, file: { $ne: null } })//  rechercher dans la base de données tous les messages qui ont un champ chat égal à req.params.chatId, qui est l'ID du chat passé dans l'URL de la requête. envoyer par le client depuis singleChat et dont le champ file n'est pas null.
      .populate("sender", "name pic email") //remplace le champ sender (qui est un ID de l'utilisateur) par les détails de l'utilisateur correspondant (nom, image et email).
      .populate("chat");
    res.json(messages); //envoyer les messages du chat récupérés en réponse à la requête HTTP donc a singlechat .
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});



//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body; 
  
  if (!content || !chatId ) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {  //détails du message.
    sender: res.locals.user._id, //l'id de l'utilisateur qui a envoyé le message qu'on a récupéré à partir du token d'authentification.
    content: content,
    chat: chatId,
    
  };

  try {
    var message = await Message.create(newMessage); // crée un nouveau message dans la base de données 

    message = await message.populate("sender", "name picture"); // peuple le champ sender (qui est un ID de l'utilisateur) avec les détails de l'utilisateur correspondant (nom et image).
    message = await message.populate("chat"); // peuple le champ chat (qui est un ID du chat) avec les détails du chat correspondant (nom et image).
    message = await UserModel.populate(message, {// peuple le champ chat.users (qui est un tableau d'ID d'utilisateurs) avec les détails des utilisateurs correspondants (nom, image et email). 
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
    const messages = await Message.find({ chat: req.params.chatId })//  rechercher dans la base de données tous les messages qui ont un champ chat égal à req.params.chatId, qui est l'ID du chat passé dans l'URL de la requête. envoyer par le client depuis singleChat
      .populate("sender", "name pic email") //remplace le champ sender (qui est un ID de l'utilisateur) par les détails de l'utilisateur correspondant (nom, image et email)
      .populate("chat")
    res.json(messages); //envoyer les messages du chat récupérés en réponse à la requête HTTP donc a singlechat .
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


//@description     supp all Messages
//@route           GET /api/Message/Supp/:chatId
//@access          Protected
const deleteAllMsgs = asyncHandler(async (req ,res) => {

  try {
    await Message.deleteMany({ chat: req.params.chatId });
    console.log('All messages in chat ' + req.params.chatId + Chat.chatName + ' have been deleted.');
  } catch (error) {
    console.error('An error occurred while trying to delete messages:', error);
  }

});


//@description     supp all Messages
//@route           GET /api/Message/Supp/:chatId/:MsgId
//@access          Protected
// const deleteOneMsg = asyncHandler(async (req, res) => {


const deleteOneMsg = asyncHandler(async (req, res) => {
  try {
    const message = await Message.findById(req.params.MsgId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await Message.deleteOne({ _id: req.params.MsgId });
    await Chat.findByIdAndUpdate(message.chat, { $push: { deleted: req.params.MsgId } });//ajoute l'ID du message supprimé à l'array deleted du document Chat correspondant
    const updatedChat = await Chat.findById(message.chat);
    console.log('Updated deleted array:', updatedChat.deleted);
    console.log('Message ' + req.params.MsgId + ' has been deleted.');
    res.json({ message: 'Message has been deleted and its id has been added to the deleted array.', deleted: updatedChat.deleted });
  } catch (error) {
    console.error('An error occurred while trying to delete the message:', error);
  }
})


module.exports = { allMessages, sendMessage, deleteAllMsgs, deleteOneMsg, transferMessage, sendFiles, fetchFiles};