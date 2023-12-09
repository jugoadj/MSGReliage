const notFound = (req, res, next) => {//notFound : Ce middleware est utilisé pour gérer les cas où aucune route correspondante n'a été trouvée pour la requête entrante. Il crée une nouvelle erreur avec un message indiquant que la route demandée n'a pas été trouvée, définit le statut de la réponse à 404 (Not Found) et passe l'erreur au prochain middleware.
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {//errorHandler : Ce middleware est utilisé pour gérer les erreurs. Il définit le statut de la réponse à 500 (Internal Server Error) si le statut de la réponse n'a pas déjà été défini, puis renvoie un objet JSON avec le message d'erreur et la pile d'appels (stack trace) si l'environnement est en mode développement.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };