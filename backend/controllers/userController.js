const asyncHandler = require('express-async-handler');
const User = require('../models/userModel') // importe le modèle User de la usermodel.js
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;// extrait les informations de l'utilisateur (nom, email, mot de passe et photo) de la requête entrante envoyée par le client(frontend react). depuis le formulaire d'inscription. dans signup.js

    
    if (!name || !email || !password) {//si le nom, l'email et le mot de passe ont pas été fournis. elle renvoie une erreur 400 avec un message d'erreur.
        res.status(400);
        throw new Error('Veuillez remplir tous les champs');
    } 

    const userExists = await User.findOne({ email });
    if (userExists) { //si l'utilisateur existe déjà dans la base de données. elle renvoie une erreur 400 avec un message d'erreur.    
        res.status(400);
        throw new Error('Cet utilisateur existe déjà');
    }

    const user = await User.create({ //crée un nouvel utilisateur dans la base de données grace au model User qu'on a importe depuis usrmodel.js avec les informations fournies.
        name,
        email,
        password,
        pic
    });

    if (user) { // si l'utilisateur a été créé avec succès.  elle renvoie une réponse 201 avec les informations de l'utilisateur et un token généré. Sinon, elle renvoie une erreur 400 avec un message d'erreur.
        res.status(201).json({
            _id: user._id, // l'id unique de l'utilisateur (_id) qui a ete cree automatiquement par mongodb lorsque on un inserer un nouveau user dans la base de donnees 
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id), //fonction qui génère un token JWT (JSON Web Token) pour l'utilisateur
            //ID est passée à la fonction generateToken pour créer un token (jwt ) unique pour cet utilisateur. 
            //un token est une chaîne de caractères cryptée qui contient des informations sur l'utilisateur. Il est généralement 
            //envoyé au client après une réussite de connexion, et le client doit ensuite l'inclure dans les en-têtes de ses requêtes pour prouver qu'il est authentifié.
            
        });
    } else {
        res.status(400);
        throw new Error('Données invalides user pas cree');
    }

});

const authUser = asyncHandler( async(req,res) => {
    const { email, password } = req.body;

    if (!email || !password){
        res.status(400);
        throw new Error('Veuillez remplir tous les champs ohh');
    };

    const user = await User.findOne({ email }); //recherche l'utilisateur dans la base de données par son email si il existe alors user = true
    
    if (user && (await user.matchPassword(password))) { //si l'utilisateur existe et que le mot de passe entré correspond au mot de passe haché stocké dans la base de données. elle renvoie une réponse 200 avec les informations de l'utilisateur et un token généré. Sinon, elle renvoie une erreur 400 avec un message d'erreur.      
        //on va comparer les deux mdp grace a la fonction matchPassword qu'on a creer dans le model usermodel.js  
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400);
        throw error('Email ou mot de passe incorrect');
    }
});

// /api/user?search=jugo
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ?  { //vérifie si un paramètre de recherche a été fourni dans la requête (par exemple, /api/users?search=john)
        //Si c'est le cas, il crée un objet de recherche MongoDB qui recherche les utilisateurs dont le nom ou l'e-mail contient le mot-clé de recherche. 
        $or: [//requête MongoDB qui recherche les utilisateurs dont le nom ou l'e-mail correspond au mot-clé de recherche. $regex est utilisé pour effectuer une recherche par expression régulière, et $options: 'i' rend la recherche insensible à la casse.
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ],
    } : {};  //sinon Si aucun paramètre de recherche n'est fourni, il crée un objet vide, ce qui signifie que tous les utilisateurs seront renvoyés.

    const users = await User.find( keyword).find({ _id: { $ne: req.user._id }}); // requête MongoDB pour trouver les utilisateurs. Elle utilise l'objet keyword créé précédemment pour filtrer les utilisateurs par nom ou e-mail. Elle utilise également { _id: { $ne: req.user._id }} pour exclure l'utilisateur actuellement connecté de la liste des utilisateurs renvoyés.
    res.send(users);//on envoie la liste des utilisateurs trouvés en réponse à la requête HTTP.

    
});

module.exports = { registerUser , authUser , allUsers };