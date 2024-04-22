const {
  selectTopics,
  insertTopic
} = require('../models/topics.models');

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => res.status(200).send({ topics }))
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  const topic = req.body;
  const keyCount = Object.keys(topic).length;

  if (!topic.slug || !topic.description || keyCount != 2)
    return res.status(400).send({ msg: "Bad request" });

  insertTopic(topic)
    .then((article) => res.status(201).send({ topic }))
    .catch(next);
};