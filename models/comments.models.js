const db = require('../db/connection');

exports.deleteComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({ rowCount }) => {
      if (rowCount === 0)
        return Promise.reject({ status: 404, msg: "No such comment" });
    })
};

exports.updateCommentById = (comment_id, incVotes) => {
  return db
    .query(`
      UPDATE comments SET votes = votes + $1
        WHERE comment_id = $2 RETURNING *;`,
        [incVotes, comment_id])
    .then(({ rows: [comment] }) => {
      if (comment) 
        return comment;

      return Promise.reject({ status: 404, msg: "No such comment" });
    });
};