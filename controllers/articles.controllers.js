const { checkArticleExists } = require('../db/utils');

const {
   selectArticleById,
   selectArticles,
   selectArticleCommentsById,
   updateArticleById,
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
  const { sort_by, order, topic } = req.query;

  selectArticles(sort_by, order, topic)
  .then((articles) => {
    if (articles.length > 0)
      res.status(200).send({ articles });
    else
      res.status(404).send({ msg: "Topic not found" });
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

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const patch = req.body;
  let isValidPatch = true;

  if (!patch.incVotes || typeof patch.incVotes !== 'number')
    isValidPatch = false;
  else
    isValidPatch = Object.keys(patch).length === 1;

  if (!isValidPatch) {
    res.status(400).send({ msg: "Bad request" });
    return;
  }

  updateArticleById(article_id, patch.incVotes)
    .then ((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
