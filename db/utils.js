const db = require('./connection');
const format = require('pg-format');

// Check if a there exists a value in a column of a specific table.

const checkExists = async (table, column, value, status, errorMsg) => {
  const queryString = format('SELECT * FROM %I WHERE %I = $1;', table, column);
  const { rows } = await db.query(queryString, [value]);

  if (rows.length === 0)
    return Promise.reject({ status: status, msg: errorMsg });
};             

exports.checkArticleExists = (article_id) =>
  checkExists('articles', 'article_id', article_id, 404, "No such article");

exports.checkUsernameExists = (username) =>
  checkExists('users', 'username', username, 404, "No such user");

exports.checkCommentExists = (comment_id) =>
  checkExists('comments', 'comment_id', comment_id, 404, "No such comment");

exports.checkTopicExists = (slug) =>
  checkExists('topics', 'slug', slug, 404, "No such topic");