const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
  return db
    .query(`
      SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .catch((err) => {
      return Promise.reject({ status: 400, msg: "Bad request" });
    })
    .then(({ rows }) => {
        const article = rows[0];

        if (article) 
          return article;

        return Promise.reject({ status: 404, msg: "No such article" });
    });
};