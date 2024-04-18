const express = require('express');
const app = express();

const { getApi } = require('./controllers/api.controllers');

const { getTopics } = require('./controllers/topics.controllers');

const { addCommentToArticle, removeComment } = require('./controllers/comments.controllers');

const {
  getArticleById,
  getArticles,
  getArticleCommentsById,
  patchArticleById
} = require('./controllers/articles.controllers');

const { getUsers } = require('./controllers/users.controllers');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleById);

app.patch('/api/articles/:article_id', patchArticleById);

app.get('/api/articles/:article_id/comments', getArticleCommentsById);

app.post('/api/articles/:article_id/comments', addCommentToArticle);

app.delete('/api/comments/:comment_id', removeComment);

app.get('/api/users', getUsers);

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
    case '42703':
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