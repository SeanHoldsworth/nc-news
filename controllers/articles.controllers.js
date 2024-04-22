const { checkArticleExists, checkUsernameExists, checkTopicExists } = require('../db/utils');

const {
   selectArticleById,
   selectArticles,
   selectArticleCommentsById,
   updateArticleById,
   insertComment,
   insertArticle,
   deleteArticle
} = require('../models/articles.models');

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then(article => res.status(200).send({ article }))
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, p, limit } = req.query;

  const promises = [selectArticles(sort_by, order, topic, p, limit)];

  if (topic)
    promises.push(checkTopicExists(topic));

  Promise.all(promises)
    .then(([response]) => {
      if (p) 
        res.status(200).send(response);
      else 
        res.status(200).send({ articles: response });
    })
    .catch(next);
};

exports.getArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  const { p, limit } = req.query;

  Promise.all(
    [selectArticleCommentsById(article_id, p, limit), checkArticleExists(article_id)])
    .then(([comments]) => res.status(200).send({ comments }))
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

  if (!isValidPatch)
    return res.status(400).send({ msg: "Bad request" });

  updateArticleById(article_id, patch.incVotes)
    .then (article => res.status(200).send({ article }))
    .catch(next);
};

// Here it is necessary to check for the existence of both the article_id and the username
// of the comment in the database. These checks must be carried out before it is safe to
// attempt to insert the comment because they are both foreign keys and if either do not
// exist then the DB will be very unhappy.

// This means the two Promises carrying out these checks must complete before the insertion
// of the new comment can be attempted.

exports.addCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  let validComment = true;

  if (Object.keys(comment).length !== 2)
    validComment = false;
  else
    if (!Object.hasOwn(comment, 'body') || !Object.hasOwn(comment, 'username'))
      validComment = false;

  if (!validComment)
    return res.status(400).send({ msg: "Bad request" });

  comment.article_id = article_id;
  
  Promise.all([checkArticleExists(article_id), checkUsernameExists(comment.username)])
    .then(() => insertComment(comment))
    .then(comment => res.status(201).send({ comment }))
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const article = req.body;
  const keyCount = Object.keys(article).length;
  let validArticle = true;

  if (!article.author || !article.title || !article.body || !article.topic)
    validArticle = false;
  else
    validArticle = article.article_img_url ? keyCount === 5 : keyCount === 4;

  if (!validArticle)
    return res.status(400).send({ msg: "Bad request" });

  Promise.all([checkUsernameExists(article.author), checkTopicExists(article.topic)])
    .then(() => insertArticle(article))
    .then(article => res.status(201).send({ article }))
    .catch(next);
};

exports.removeArticleById = (req, res, next) => {
  const { article_id } = req.params;

  deleteArticle(article_id)
    .then(() => res.status(204).send())
    .catch(next);
};