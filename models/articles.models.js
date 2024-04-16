const db = require('../db/connection');

exports.selectArticles = () => {
  return db
    .query(`
      SELECT a.author, title, article_id, topic, a.created_at, a.votes,
        article_img_url, count(c.article_id)::INTEGER comment_count
      FROM articles a LEFT JOIN comments c USING (article_id)
      GROUP BY article_id ORDER BY a.created_at DESC;`)
    .then(({ rows: articles }) => {
      return articles;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`
      SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then(({ rows }) => {
        const article = rows[0];

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

exports.checkArticleExists = (article_id) => {
  return db
    .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    //.then(({ rows: { comments } }) => {
    .then(({ rows: articles }) => {
      if (articles.length === 0)
        return Promise.reject({ status: 404, msg: "No such article" });
    });
};