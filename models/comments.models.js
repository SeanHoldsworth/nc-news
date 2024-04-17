const db = require('../db/connection');
const format = require('pg-format');

exports.insertComment = (comment) => {
  return db
    .query(format(`
      INSERT INTO comments
        (author, body, article_id)
      VALUES %L RETURNING *;`,
        [[comment.username, comment.body, comment.article_id]]))
  .then(( { rows } ) => {
    return rows[0];
  })
};

exports.deleteComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({ rowCount }) => {
      if (rowCount === 0)
        return Promise.reject({ status: 404, msg: "No such comment" });
    })

}