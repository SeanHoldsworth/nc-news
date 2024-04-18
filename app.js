const express = require('express');
const app = express();

const apiRouter = require('./routes/api.router');

app.use(express.json());

app.use('/api', apiRouter);

app.all('*', (request, response, next) => {
  response.status(404).send({ msg: 'Endpoint not found' });
})

for (const handler of Object.values(require('./error-handlers')))
  app.use(handler);

module.exports = app;