const jwt = require('jsonwebtoken'); 

const generateToken = (id) => { //fonction qui génère un token JWT (JSON Web Token) prend un id en argument, l'ID d'un utilisateur. 
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' }); 
    // la fonction sign() prend trois arguments: le payload(qui est un objet contenant les revendications du token. Dans ce cas, le payload est { id }  ce qui signifie que le token contiendra l'ID de l'utilisateur.), la cle secrete (utilisée pour signer le token. Dans ce cas, la clé) et les option (contien d'autres paramètres pour le token.).
    //{ id } est une revendication privée. Vous encodez l'ID de l'utilisateur dans le token JWT, et vous pouvez ensuite utiliser cet ID pour identifier l'utilisateur lorsqu'il envoie une requête avec le token
};
module.exports = generateToken; 