const { checkArticleExists, checkUsernameExists } = require('../db/utils');

const {
   selectArticleById,
   selectArticles,
   selectArticleCommentsById,
   updateArticleById,
   insertComment
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

// Here it is necessary to check for the existence of both the article_id and the username
// of the comment in the database. These checks must be carried out before it is safe to
// attempt to insert the comment because they are both foreign keys and if either do not
// exist then the DB will be very unhappy.

// This means the two Promises carrying out these checks must complete before the insertion
// of the new comment can be attempted.

exports.addCommentToArticle = async (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  let validComment = true;

  if (Object.keys(comment).length !== 2)
    validComment = false;
  else
    if (!Object.hasOwn(comment, 'body') || !Object.hasOwn(comment, 'username'))
      validComment = false;

  if (!validComment) {
    res.status(400).send({ msg: "Bad request" });
    return;
  }

  comment.article_id = article_id;
  
  Promise.all([checkArticleExists(article_id), checkUsernameExists(comment.username)])
    .then(() => {
      return insertComment(comment)
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};