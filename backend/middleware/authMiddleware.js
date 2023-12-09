const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

// middleware d'authentification pour protéger certaines routes qui nécessitent une authentification.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (// vérifie d'abord si un en-tête d'autorisation existe et s'il commence par "Bearer". C'est une convention courante pour envoyer un token JWT (JSON Web Token) dans les en-têtes HTTP.
  //Une fois qu'un utilisateur s'est connecté, le serveur génère un token JWT et le renvoie à l'application cliente.
  //Nous utilisons ensuite la méthode localStorage.setItem pour stocker ce token dans le localStorage du navigateur. 
  //Le localStorage est un espace de stockage web qui permet de stocker des données entre les sessions de navigation
  //Cela signifie que même si l'utilisateur ferme son navigateur, le token sera toujours disponible lorsqu'il reviendra sur le site.
  // L'application cliente doit ensuite inclure ce token dans l'en-tête Authorization de chaque requête HTTP qu'elle envoie au serveur. C'est ce qu'on appelle l'authentification par token.  

    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
   ) {
    try {
      token = req.headers.authorization.split(" ")[1];//récupère le token à partir de l'en-tête d'autorisation et le divise en deux parties: le mot "Bearer" et le token lui-même.

      //décode le token en utilisant la clé secrète JWT (stockée dans process.env.JWT_SECRET).
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");//utilise l'ID utilisateur décodé du token pour rechercher l'utilisateur dans la base de données (en excluant le mot de passe de l'utilisateur de la réponse).

      next();
    } catch (error) { // si le token est invalide), il renvoie une réponse avec un statut 401 et un message d'erreur.
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) { //Si aucun token n'est fourni, renvoie  une réponse avec un statut 401 et un message d'erreur.
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };