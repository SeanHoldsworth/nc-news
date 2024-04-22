const db = require('../db/connection');
const format = require('pg-format');

exports.selectTopics = () => {
  return db
    .query(`
      SELECT * FROM topics;`)
    .then(({ rows }) =>  rows);
};

exports.insertTopic = (topic) => {
  return db
    .query(format(
      'INSERT INTO topics (slug, description) VALUES %L RETURNING *;',
      [[topic.slug, topic.description]]))
    .then(({ rows: [topic] }) => topic);
};