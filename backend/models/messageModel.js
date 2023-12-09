//le shema message doit contenir:
//le nom ou l'id de lexpediteur
// le contenu du message
// l'id du chat a qui il apartient
//
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { //contient les id des user(Spécifie que ces identifiants d'objets font référence à des documents de la collection "User".) associer a ce message
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    content: { 
        type: String, 
        trim: true 
    },
    chat: {  
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chat" 
    },
    readBy: [
        { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
        }
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;