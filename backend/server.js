const express = require("express"); //importe le module express et le stocker dans la variable express pour pouvoir etuliser les fonctionnalite de express juste avec la variable non pas en le chargant a chaque fois
const dotenv = require("dotenv"); //import le module dotenv quon a istalller 
// const { chats } = require("./data/data");//mportée un objet nommé chats à partir d'un module situé dans le fichier "./data/data"
const connectDB = require("./config/db");//importer le module connectDB à partir du fichier ./config/db.js
const userRoutes = require("./routes/userRoutes");//importer le module userRoutes à partir du fichier ./routes/userRoutes.js
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const chatRoutes  = require("./routes/chatRoutes");
const messageRoutes  = require("./routes/messageRoutes");

dotenv.config(); //charger les variables d'environnement à partir d'un fichier .env

connectDB(); // appeler la fonction connectDB pour établir une connexion à la base de données MongoDB.
//dans server.js, on appele connectDB() pour initier cette connexion lorsque le serveur démarre.

const app = express(); //réez une instance d'application Express. Cette instance représente votre application web.

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
const server = app.listen(5000, console.log(`server started on port ${PORT}`));

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});