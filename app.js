const express = require('express');
const app = express();

const { getApi } = require('./controllers/api.controllers');

const { getTopics } = require('./controllers/topics.controllers');

const { addCommentToArticle } = require('./controllers/comment.controllers');

const {
  getArticleById,
  getArticles,
  getArticleCommentsById
} = require('./controllers/articles.controllers');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getArticleCommentsById);

app.post('/api/articles/:article_id/comments', addCommentToArticle);

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
  switch(err.code) {
    case '22P02':
    case '23503':
      response.status(400).send({ msg: "Bad request" });
      break;
    
    default:
      if (err.code)
        console.log("Postgres error", err.code);
      next(err);
  }
});

// Handle server errors.

app.use((err, request, response, next) => {
  console.log('server', err);
  response.status(500).send({ msg: 'Internal server error'});
});

module.exports = app;