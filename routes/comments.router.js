const { removeComment, patchCommentById } = require('../controllers/comments.controllers');

const commentsRouter = require('express').Router();

commentsRouter
  .route('/:comment_id')
  .delete(removeComment)
  .patch(patchCommentById);

module.exports = commentsRouter;