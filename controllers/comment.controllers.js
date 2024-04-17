const { insertComment } = require('../models/comments.models');
const { checkArticleExists, checkUsernameExists } = require('../db/utils');

// Here it is necessary to check for the existence of both the article_id and the username
// of the comment in the database. These checks must be carried out before it is safe to
// attempt to insert the comment because they are both foreign keys and if either do not
// exist then the DB will be very unhappy.

// This means the two Promises carrying out these checks must complete before the insertion
// of the new comment can be attempted. This is the cleanest way I can think of doing this
// but I *really* do not like the need to wrap insertComment in an anonymous function just
// to have it called. Surely there must be a cleaner way of doing this?

exports.addCommentToArticle = (req, res, next) => {
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
    .then(() => {                   // This is HORRIBLE! Is there a cleaner way of doing this?
      insertComment(comment)
        .then((comment) => {
          res.status(201).send({ comment });
        })
        .catch(next);               // Also, why is this needed when there is a catch below it?
    })
    .catch(next);
};

exports.updateArticle = (req, res, next) => {
};
