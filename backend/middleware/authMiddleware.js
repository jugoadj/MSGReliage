// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel.js");
// const asyncHandler = require("express-async-handler");

// // middleware d'authentification pour protéger certaines routes qui nécessitent une authentification.
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (// vérifie d'abord si un en-tête d'autorisation existe et s'il commence par "Bearer". C'est une convention courante pour envoyer un token JWT (JSON Web Token) dans les en-têtes HTTP.
//   //Une fois qu'un utilisateur s'est connecté, le serveur génère un token JWT et le renvoie à l'application cliente.
//   //Nous utilisons ensuite la méthode localStorage.setItem pour stocker ce token dans le localStorage du navigateur. 
//   //Le localStorage est un espace de stockage web qui permet de stocker des données entre les sessions de navigation
//   //Cela signifie que même si l'utilisateur ferme son navigateur, le token sera toujours disponible lorsqu'il reviendra sur le site.
//   // L'application cliente doit ensuite inclure ce token dans l'en-tête Authorization de chaque requête HTTP qu'elle envoie au serveur. C'est ce qu'on appelle l'authentification par token.  

//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//    ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];//récupère le token à partir de l'en-tête d'autorisation et le divise en deux parties: le mot "Bearer" et le token lui-même.

//       //décode le token en utilisant la clé secrète JWT (stockée dans process.env.JWT_SECRET).
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select("-password");//récupère l'utilisateur à partir de la base de données en utilisant l'ID stocké dans le token décodé.
//       //req.user est maintenant disponible dans toutes les routes protégées, ce qui nous permet d'accéder à l'utilisateur connecté.
//       //req.user contient tous les détails de l'utilisateur, à l'exception de son mot de passe.
//       next();
//     } catch (error) { // si le token est invalide), il renvoie une réponse avec un statut 401 et un message d'erreur.
//       res.status(401);
//       throw new Error("Not authorized, token failed");
//     }
//   }

//   if (!token) { //Si aucun token n'est fourni, renvoie  une réponse avec un statut 401 et un message d'erreur.
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }
// });
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

module.exports.checkUser = (req, res, next) => { //
  const token = req.cookies.jwt; 
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.cookie("jwt", "", { maxAge: 1 });
        next();
      } else {
        let user = await UserModel.findById(decodedToken.id); // on récupère l'id de l'utilisateur connecté
        res.locals.user = user; // on stocke les informations de l'utilisateur dans res.locals.user
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.send(200).json('no token')
      } else {
        console.log(decodedToken.id);
        next();
      }
    });
  } else {
    console.log('No token');
  }
};

