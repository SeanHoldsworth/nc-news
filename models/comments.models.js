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