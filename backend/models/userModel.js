
//le shema user auras 
// name 
// email
// password
// pic
// isadmin
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(// un schéma est une représentation de la structure de vos données. Il définit la forme des documents dans une collection MongoDB. Mongoose utilise le schéma pour la validation des données avant qu'elles ne soient enregistrées dans la base de données.
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);

//on cree une fonction matchPassword qui est un fonction pour comparer les  mot de passe elle prend en paramettre le mot de passe entrer par le user et le compare avec le mot de passe hacher stocker dans la base de donnees
userSchema.methods.matchPassword = async function (enteredPassword) {
  //bcrypt est une fonction qui prend le mot de passe en clair entrer paruser et le mot de passe haché, les compare et renvoie true si ils correspondent, false sinon. this.password fait référence au mot de passe de l'utilisateur actuel (celui qui est stocké dans la base de données).
  return await bcrypt.compare(enteredPassword, this.password); 
};


//avant de save le schema du user dans la bdd on va crypter le password
userSchema.pre("save", async function (next) { 
  if (!this.isModified) { //isModified est une propriété de mongoose qui indique si un document a été modifié ou non. 
    //Si le mot de passe n'a pas été modifié, on appelle next() pour passer au middleware suivant.
    //Si le mot de passe a été modifié, on hache le mot de passe avec bcrypt et on appelle
    next();
  }

  const salt = await bcrypt.genSalt(10); //génère un "sel" pour le hachage du mot de passe. Le sel est une chaîne aléatoire qui est ajoutée au mot de passe pour augmenter la sécurité du hachage.
  this.password = await bcrypt.hash(this.password, salt);//Cette ligne hache le mot de passe de l'utilisateur avec le sel généré. Le mot de passe haché est ensuite stocké dans la base de données à la place du mot de passe en clair.
});

const User = mongoose.model("User", userSchema); //Un modèle Mongoose est un constructeur qui prend un schéma et crée une instance d'un document équivalent à des enregistrements dans une base de données relationnelle. Les modèles sont responsables de la création et de la lecture des documents à partir de la base de données MongoDB sous-jacente.

module.exports = User;