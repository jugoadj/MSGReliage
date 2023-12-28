const express = require("express"); //importe le module express et le stocker dans la variable express pour pouvoir etuliser les fonctionnalite de express juste avec la variable non pas en le chargant a chaque fois
const dotenv = require("dotenv"); //import le module dotenv quon a istalller 
// const { chats } = require("./data/data");//mportée un objet nommé chats à partir d'un module situé dans le fichier "./data/data"
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const connectDB = require("./config/db");//importer le module connectDB à partir du fichier ./config/db.js
const userRoutes = require("./routes/user.routes");//importer le module userRoutes à partir du fichier ./routes/userRoutes.js
const emailRoutes = require ('./routes/email.routes');

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const chatRoutes  = require("./routes/chatRoutes");
const messageRoutes  = require("./routes/messageRoutes");
const {checkUser, requireAuth} = require ('./middleware/authMiddleware');
const cors = require('cors');

dotenv.config(); //charger les variables d'environnement à partir d'un fichier .env

connectDB(); // appeler la fonction connectDB pour établir une connexion à la base de données MongoDB.

const app = express(); //réez une instance d'application Express. Cette instance représente votre application web.

const corsOptions = { 
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}

app.use(cors(corsOptions));//

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('*', checkUser ); // pour que checkUser soit appelé sur toutes les routes
app.get('/jwtid', requireAuth, (req, res) => { //pour récupérer l'id de l'utilisateur connecté
    res.status(200).send(res.locals.user._id)
});

app.use(express.json()); //utiliser le middleware express.json pour analyser le corps des requêtes envoyées au serveur en tant que JSON. (pour accepter les data json)


app.get('/', (req, res) => {//Ici, on définit une route qui répond à la méthode HTTP GET sur le chemin ('/') de l'application. Lorsqu'un client effectue une requête GET sur la racine de l'application (par exemple, en accédant à http://votre-domaine/), le callback passé à app.get est appelé.

    res.send("API is running");
});

// l'API est définie par les routes que vous avez configurées avec Express.js.
// Dans le code que vous avez fourni, vous avez une ligne qui monte un middleware de route sur un chemin spécifique :
// app.use('/api/user', userRoutes);
// Cela signifie que toutes les requêtes qui commencent par /api/user seront gérées par userRoutes. userRoutes est p un module qui définit plusieurs routes liées aux utilisateurs (par exemple, pour créer un nouvel utilisateur, obtenir les détails d'un utilisateur, mettre à jour un utilisateur, etc.).

app.use('/api/user', userRoutes); // /api/user' est le chemin auquel le middleware userRoutes est monté. 
///Cela signifie que toutes les requêtes qui commencent par /api/user seront gérées par userRoutes.
app.use('/api/email', emailRoutes);

app.use('/uploads', express.static('uploads'));//pour rendre le dossier uploads static pour pouvoir y acceder depuis le frontend

app.use('/api/chat', chatRoutes); 
app.use('/api/message', messageRoutes);


// si l'une des url n'est pas trouvé on va utiliser les middleware notFound et errorHandler
app.use(notFound); //pour gerer les erreurs 404
app.use(errorHandler);//pour gerer les erreurs 500


//process.env est un objet dans Node.js qui contient les variables d'environnement du processus.
//process.env.PORT est utilisé pour récupérer la valeur de la variable d'environnement appelée "PORT".
//Si process.env.PORT n'est pas défini (c'est-à-dire s'il est évalué comme faux), l'opérateur OU logique || utilise la valeur à sa droite, dans ce cas, 5000.
const PORT = process.env.PORT || 5000;

//Vous utilisez l'instance de l'application (express qu'on a stocker dans la variable app) pour démarrer le 
// serveur en écoutant sur un port spécifié.
const server = app.listen(process.env.PORT, () => {
    console.log(`Listenning to port ${process.env.PORT}`);
})

const io = require("socket.io")(server, { //initialise Socket.IO sur le serveur HTTP
    pingTimeout: 60000, // délai d'attente de ping de 60 secondes et autorise les requêtes CORS provenant de "http://localhost:3000"
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => { // fonction est exécutée chaque fois qu'un client se connecte au serveur
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => { //lorsque le client se connecte, il envoie un événement "setup" au serveur avec les données de l'utilisateur
    //userData est un objet contenant des informations sur l'utilisateur qui s'est connecté. Cet objet est envoyé par le 
    //client lorsqu'il émet l'événement "setup"
    socket.join(userData._id);// 
    socket.emit("connected");//le serveur envoie un événement "connected" au client pour confirmer que la connexion a réussi
  });

  //Lorsqu'un utilisateur veut rejoindre une conversation, il envoie un événement "join chat" avec l'identifiant de la 
  //conversation comme room. Le serveur reçoit cet événement, et avec socket.join(room), il ajoute le client à cette room.
  // Ainsi, lorsque des messages sont envoyés dans cette conversation, seuls les clients dans cette room les reçoivent.

  socket.on("join chat", (room) => { //Lorsqu'un événement "join chat" est reçu (envoyer par le client), le serveur fait rejoindre au client la salle spécifiée
    socket.join(room); // le serveur ajoute le client à la salle spécifiée
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing")); //Lorsque le serveur reçoit un événement "typing" d'un client, il émet à son tour un événement "typing" à tous les autres clients dans la même "room".
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {// Lorsque le serveur reçoit un événement "new message" d'un client, il émet à son tour un événement "message received" à tous les autres clients dans la même "room".
    var chat = newMessageRecieved.chat; //extrait l'objet chat du message reçu

    if (!chat.users) {
      return console.log("chat.users not defined");
    } // vérifie si l'objet chat a une propriété users

    chat.users.forEach((user) => { //parcourt chaque utilisateur dans chat.users.
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }// Si l'ID de l'utilisateur est le même que l'ID de l'expéditeur du message, la fonction retourne immédiatement, ce qui signifie que le message n'est pas envoyé à l'expéditeur

      socket.in(user._id).emit("message recieved", newMessageRecieved); // Pour chaque utilisateur dans chat.users qui n'est pas l'expéditeur, le serveur envoie un événement "message received" avec le message original. Cela signifie que chaque utilisateur du chat reçoit le nouveau message
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// userData : C'est un objet qui contient des informations sur l'utilisateur qui s'est connecté. Il est envoyé par le client lorsqu'il émet l'événement "setup".

// room : C'est l'identifiant de la salle de chat à laquelle un utilisateur souhaite se joindre. Lorsqu'un utilisateur envoie un événement "join chat", il inclut cet identifiant de salle de chat comme room.

// newMessageRecieved : C'est un objet qui contient le nouveau message qu'un utilisateur a envoyé. Lorsqu'un utilisateur envoie un message, il est reçu par le serveur comme un événement "new message" avec cet objet newMessageRecieved
//Lorsqu'un client envoie un message, il émet un événement "new message" à l'aide de la méthode emit de socket.io. L'objet message est passé en tant que paramètre à cette méthode emit.