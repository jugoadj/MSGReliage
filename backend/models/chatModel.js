// un chat doit contenir :
// chatName
// isgroupechat #si cest un groupe ou pas 
//si c un roupe : groupeAdmin
// latestMessage

const mongoose = require("mongoose");

const chatModel = mongoose.Schema( //un modèle Mongoose pour une collection "chat" dans une base de données MongoDB
 //mongoose.Schema est utilisé pour définir le schéma, qui est une structure de données qui définit la forme des documents dans une collection MongoDB.
 //mongoose.Schema est une classe de Mongoose qui permet de définir la structure des documents dans une collection MongoDB. Un schéma en Mongoose est une configuration d'objets qui définit le type de données pour chaque champ, ainsi que d'autres propriétés comme les valeurs par défaut, les validateurs, etc. 
  {
    chatName: { 
        type: String, 
        trim: true 
    },
    isGroupChat: { type: Boolean, default: false },
    users: [{
 //users: Il s'agit d'un tableau qui stocke les identifiants d'utilisateurs(ref : user) associés à ce chat.

        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    }],
    latestMessage: { //contient les id des messages associer a ce chat
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { //contien les id des users 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
  },
  { timestamps: true }
);

//Création du modèle (Chat) :
const Chat = mongoose.model("Chat", chatModel);//Utilise le schéma chatmodel défini pour créer le modèle Mongoose appelé 
//"Chat". Ce modèle peut être utilisé pour interagir avec la collection de documents associée dans la base de données.

//Une fois que vous avez créé le modèle, vous pouvez l'utiliser pour créer, lire, mettre à jour et supprimer des documents dans la 
//collection "chats". Par exemple, pour créer un nouveau document, vous pouvez faire const newChat = new Chat({ chatName: 'Example Chat' }); newChat.save();.

module.exports = Chat;//Exporte le modèle "Chat" pour qu'il puisse être utilisé dans d'autres parties de l'application.