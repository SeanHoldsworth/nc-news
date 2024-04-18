const {
  getArticleById,
  getArticles,
  getArticleCommentsById,
  patchArticleById,
  addCommentToArticle
} = require('../controllers/articles.controllers');

const articlesRouter = require('express').Router();

articlesRouter.get('/', getArticles);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleCommentsById)
  .post(addCommentToArticle);

module.exports = articlesRouter;