const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { 
      //utilise Mongoose pour établir une connexion à la base de données MongoDB.
      //L'opérateur await est utilisé à l'intérieur d'une fonction asynchrone pour attendre que la promesse associée à une opération asynchrone soit résolue le code apres cette instruction sera executer que quand mongoose aura fini de se connecter a la base de données
      // To avoid warnings in console
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    //Si la connexion à la base de données est réussie, indiquer que la connexion à MongoDB a été établie, avec le nom de l'hôte de la base de données.

  } catch (error) {//Si une erreur survient pendant la connexion à la base de données, le bloc catch est exécuté, et un message d'erreur est affiché dans la console avec le détail de l'erreur.
    console.error(`Error: ${error.message}`);
    // Exit with failure
    process.exit(1);
  }
}
module.exports = connectDB;








