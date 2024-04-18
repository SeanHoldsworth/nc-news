const { insertComment, deleteComment } = require('../models/comments.models');
const { checkArticleExists, checkUsernameExists, checkCommentExists } = require('../db/utils');

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

exports.removeComment = (req, res, next) => {
  const { comment_id } = req.params;

  deleteComment(comment_id)
  .then(() => {
    res.status(204).send();
  })
  .catch(next);
}
