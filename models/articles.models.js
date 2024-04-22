const db = require('../db/connection');
const format = require('pg-format');

const { deleteComment } = require('../models/comments.models');

exports.selectArticles = (sort_by='created_at', order='DESC', topic, p, limit=10) => {
  order = order.toUpperCase();

  if (order != 'ASC' && order != 'DESC')
    return Promise.reject({ status: 400, msg: "Invalid sort order" });

  let queryString = `
    SELECT a.author, title, article_id, topic, a.created_at, a.votes,
      article_img_url, count(c.article_id)::INTEGER comment_count
    FROM articles a LEFT JOIN comments c USING (article_id) `;

  const queryParams = [];

  if (topic) {
    queryString += 'WHERE topic = $1 ';
    queryParams.push(topic);
  }

  queryString += `GROUP BY article_id ORDER BY a.%I %s `;

  if (p) {
    queryParams.push(limit);
    queryString += `LIMIT $${queryParams.length} `;
    queryParams.push((p - 1) * limit);
    queryString += `OFFSET $${queryParams.length};`;
  }
  else 
    queryString += ';';

  const promises = [db.query(format(queryString, sort_by, order), queryParams)];

  if (p) {
    let countQueryString = 'SELECT count(*)::INTEGER FROM articles ';

    const countQueryParams = [];

    if (topic) {
      countQueryString += 'WHERE topic = $1 ';
      countQueryParams.push(topic);
    }

    countQueryString += ';';

    promises.push(db.query(countQueryString, countQueryParams));

    return Promise.all(promises)
      .then(([{ rows: articles }, { rows: [{ count: total_count }] }]) => 
        ({ articles, total_count }));
  }
  else
    return Promise.all(promises)
      .then(([{ rows: articles }]) =>  articles);
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

exports.selectArticleCommentsById = (article_id, p, limit=10) => {
  const queryParams = [article_id];

  let queryString = `
    SELECT comments.* FROM comments LEFT JOIN articles USING (article_id)
      WHERE article_id = $1 ORDER BY created_at DESC `;

  if (p) {
    queryString += 'LIMIT $2 OFFSET $3';
    queryParams.push(limit, (p - 1) * limit);
  }

  queryString += ';';

  return db
    .query(queryString, queryParams)
    .then(({ rows: comments }) => comments);
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

exports.insertComment = (comment) => {
  return db
    .query(format(`
      INSERT INTO comments
        (author, body, article_id)
      VALUES %L RETURNING *;`,
        [[comment.username, comment.body, comment.article_id]]))
    .then(( { rows: [comment] } ) => comment);
};

exports.insertArticle = (article) => {
  let queryString = `
    INSERT INTO articles
      (author, title, body, topic`;

  const queryParams = [article.author, article.title, article.body, article.topic];

  if (article.article_img_url) {
    queryString += ',  article_img_url) ';
    queryParams.push(article.article_img_url);
  }
  else
    queryString += ') ';

  queryString += 'VALUES %L RETURNING *;';

  return db
    .query(format(queryString, [queryParams]))
    .then(( { rows: [article] } ) => {
      article.comment_count = 0;
      return article;
    });
};

exports.deleteArticle = (article_id) => {
  // First get a list of comments associated with the article using a simpler
  // query than that done in selectArticleCommentsById but we can reuse the
  // deleteComment function from the comments model.

  return db
    .query(`
      SELECT comment_id FROM comments LEFT JOIN articles USING (article_id)
        WHERE article_id = $1;`, [article_id])
    .then(( { rows: comments } ) => 
      Promise.all(comments.map(comment => deleteComment(comment.comment_id))))
    .then(() =>
      db .query(`DELETE FROM articles WHERE article_id = $1`, [article_id]))
    .then(({ rowCount }) => {
      if (rowCount === 0)
        return Promise.reject({ status: 404, msg: "No such article" });
    });
};