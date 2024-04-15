const express = require('express');
const app = express();

const {
  getTopics,
} = require('./controllers/topics.controllers');

app.use(express.json());

app.get('/api/topics', getTopics);

app.all('*', (request, response, next) => {
  response.status(404).send({ msg: 'Endpoint not found' });
})

// Handle application errors.

app.use((err, request, response, next) => {
  if (err.status && err.msg)
    response.status(err.status).send({ msg: err.msg });
  else
    next(err);
});

// Handle PostgreSQL errors.

app.use((err, request, response, next) => {
  if (err.code)
    console.log("Postgres error", err.code);
  next(err);
});

// Handle server errors.

app.use((err, request, response, next) => {
  console.log('server', err);
  response.status(500).send({ msg: 'Internal server error'});
});

module.exports = app;