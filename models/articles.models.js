const db = require('../db/connection');

exports.selectArticles = (topic) => {
  let queryString = `
    SELECT a.author, title, article_id, topic, a.created_at, a.votes,
      article_img_url, count(c.article_id)::INTEGER comment_count
    FROM articles a LEFT JOIN comments c USING (article_id) `;

  const queryParams = [];

  if (topic) {
    queryString += 'WHERE topic = $1 ';
    queryParams.push(topic);
  }

  queryString += 'GROUP BY article_id ORDER BY a.created_at DESC;';

  return db
    .query(queryString, queryParams)
    .then(({ rows: articles }) => {
      return articles;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`
      SELECT a.*, count(c.article_id)::INTEGER comment_count
      FROM articles a LEFT JOIN comments c USING (article_id)
      WHERE article_id = $1
      GROUP BY article_id ORDER BY a.created_at DESC;`, [article_id])
    .then(({ rows: [article] }) => {
        if (article) 
          return article;

        return Promise.reject({ status: 404, msg: "No such article" });
    });
};

exports.selectArticleCommentsById = (article_id) => {
  return db
    .query(`
      SELECT comments.* FROM comments LEFT JOIN articles USING (article_id)
        WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
    .then(({ rows: comments }) => {
        return comments;
    });
};

exports.updateArticleById = (article_id, incVotes) => {
  return db
    .query(`
      UPDATE articles SET votes = votes + $1
        WHERE article_id = $2 RETURNING *;`,
        [incVotes, article_id])
    .then(({ rows: [article] }) => {
      if (article) 
        return article;

      return Promise.reject({ status: 404, msg: "No such article" });
    });
};