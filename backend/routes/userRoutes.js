const express = require("express");
const {registerUser, authUser, allUsers} = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')
const router = express.Router();

router.route('/').post(registerUser)//Ceci ajoute un gestionnaire de route pour les requêtes HTTP POST à la route '/'. 
//registerUser est une fonction middleware qui sera exécutée chaque fois qu'une requête POST est reçue sur cette route. 
router.route('/').get(protect, allUsers)// doit passer par le middleware protect  et ensuite appeler la fonction allUsers pour pouvoir acceder a la route /api/users  et le middleware protect va verifier si le token est valide ou pas

//La principale différence entre router.route() et router.post() réside dans la façon dont vous pouvez chaîner les gestionnaires pour différentes méthodes HTTP.
// router.post() est une méthode qui ajoute un gestionnaire pour les requêtes POST à une route spécifique. Vous ne pouvez pas chaîner d'autres gestionnaires de méthode à router.post().
// router.route() est une méthode qui crée une instance de route à laquelle vous pouvez attacher plusieurs gestionnaires de méthode. Par exemple, vous pouvez utiliser router.route() pour ajouter des gestionnaires pour les requêtes GET, POST, PUT, etc. à la même route
router.post('/login', authUser)

module.exports = router;

