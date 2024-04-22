const {
  getArticleById,
  getArticles,
  getArticleCommentsById,
  patchArticleById,
  addCommentToArticle,
  postArticle,
  removeArticleById
} = require('../controllers/articles.controllers');

const articlesRouter = require('express').Router();

articlesRouter
  .route('/')
  .get(getArticles)
  .post(postArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(removeArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleCommentsById)
  .post(addCommentToArticle);

module.exports = articlesRouter;