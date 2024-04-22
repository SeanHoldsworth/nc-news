const { deleteComment, updateCommentById } = require('../models/comments.models');

exports.removeComment = (req, res, next) => {
  const { comment_id } = req.params;

  deleteComment(comment_id)
    .then(() => res.status(204).send())
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const patch = req.body;
  let isValidPatch = true;

  if (!patch.inc_votes || typeof patch.inc_votes !== 'number')
    isValidPatch = false;
  else
    isValidPatch = Object.keys(patch).length === 1;

  if (!isValidPatch)
    return res.status(400).send({ msg: "Bad request" });

  updateCommentById(comment_id, patch.inc_votes)
    .then (comment => res.status(200).send({ comment }))
    .catch(next);
};
