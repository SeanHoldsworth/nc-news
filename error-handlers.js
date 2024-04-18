// Handle application errors.

exports.applicationErrorHandler = (err, request, response, next) => {
  if (err.status && err.msg)
    response.status(err.status).send({ msg: err.msg });
  else
    next(err);
};

// Handle PostgreSQL errors.

exports.databaseErrorHandler = (err, request, response, next) => {
  switch(err.code) {
    case '22P02':
    case '42703':
      response.status(400).send({ msg: "Bad request" });
      break;
    
    default:
      if (err.code)
        console.log("Postgres error", err.code);
      next(err);
  }
};

// Handle server errors.

exports.serverErrorHandler = (err, request, response, next) => {
  console.log('server', err);
  response.status(500).send({ msg: 'Internal server error'});
};