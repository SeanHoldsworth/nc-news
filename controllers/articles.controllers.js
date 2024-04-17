const { checkArticleExists } = require('../db/utils');

const {
   selectArticleById,
   selectArticles,
   selectArticleCommentsById,
} = require('../models/articles.models');

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles()
  .then((articles) => {
      res.status(200).send({ articles });
  })
  .catch(next);
};

exports.getArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;

  Promise.all(
    [selectArticleCommentsById(article_id), checkArticleExists(article_id)])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
