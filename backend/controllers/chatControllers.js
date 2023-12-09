const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // extrait la propriété userId du corps de la requête HTTP (req.body) que le client a enver en utilisant post {{url}}/api/chat. avec comme body de la requete {userId: "l'id de l'utilisateur avec qui on veut creer un chat"}


  if (!userId) {// si userid n'existe pas dans req.body on renvoie une erreur 400 avec un message d'erreur.
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  
  var isChat = await Chat.find({// requete a la base données pour trouver un chat qui n'est pas un groupe et qui contient à la fois l'utilisateur 
    //actuellement connecté (req.user._id) et l'utilisateur spécifié par userId.
    isGroupChat: false,
    $and: [//
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")// remplir les informations des utilisateurs de chaque chat, à l'exception de leur mot de passe.
    .populate("latestMessage");// remplir les informations du dernier message de chaque chat.

  isChat = await User.populate(isChat, { //appelle la méthode populate sur le modèle User de Mongoose. Elle prend deux arguments : le document ou la liste de documents à peupler (dans ce cas, isChat), et un objet qui spécifie comment peupler les documents.
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) { // si il ya pas de chat on renvoie un tableau vide sinon on renvoie le chat
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId], // les users du chat sont l'utilisateur actuellement connecté et l'utilisateur spécifié par userId.(envoyer par la requete du client dans req.body)
    };

    try {
      const createdChat = await Chat.create(chatData); // on cree un nouveau chat dans la base de données avec les données de chatData
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(// on recupere le chat qu'on vient de creer dans la base de données
        "users",
        "-password"
      );
      res.status(200).json(FullChat);// on renvoie le chat comme response
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    // trouver tous les chats qui contiennent l'utilisateur actuellement connecté dans leur tableau users
      .populate("users", "-password")// remplit les informations des utilisateurs de chaque chat, à l'exception de leur mot de passe.
      .populate("latestMessage")// remplit les informations du dernier message de chaque chat.
      .sort({ updatedAt: -1 })//
      .then(async (results) => {
        results = await User.populate(results, { // emplit les informations de l'utilisateur qui a envoyé le dernier message de chaque chat,
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);// on renvoie les resultats
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {// si le client na pas mis de nom ou de users 
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);//

  if (users.length < 2) {// pour creer un groupe il faut au moins 2 users
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);// on ajoute l'utilisateur actuellement connecté au groupe

  //req.user est l'utilisateur actuellement connecté.(authentifié) qu'on a stocker dans req.user grace au middleware protect

  //req.body.users fait référence à une propriété users dans le corps de la requête HTTP. envoyée par le client lorsqu'il fait une requête àu serveur.  req.body.users est une chaine JSON qui représente une liste d'utilisateur
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user, // l'utilisateur actuellement connecté est l'administrateur du groupe
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })// on recupere le groupe qu'on vient de creer dans la base de données
      .populate("users", "-password") // remplit les informations des users de chaque chat, à l'exception de leur mot de passe.
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat); // on renvoie le groupe comme response qui contiendra donc les users (qu'on a ajouter )et l'admin du groupe(le user connecter)
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};