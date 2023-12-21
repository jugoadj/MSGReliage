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

    file: { // Nouveau champ pour stocker l'URL du fichier
        type: String,
        trim: true
    },
    //Pour récupérer tous les fichiers envoyés dans une conversation, on vaeffectuer une requête sur la collection Message pour obtenir tous les messages 
    //avec un chatId spécifique et un file non nul. Vous pouvez ensuite renvoyer les URL des fichiers dans la réponse à la requête.

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