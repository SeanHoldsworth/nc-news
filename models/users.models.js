const db = require('../db/connection');

exports.selectUsers = () => {
  return db
    .query('SELECT * FROM users;')
    .then(({ rows: users }) => users);
};

exports.selectUserByUsername = (username) => {
  return db
    .query('SELECT * FROM users WHERE username = $1;', [username])
    .then(({ rows: [user] }) => {
      if (user) 
        return user;

      return Promise.reject({ status: 404, msg: "No such username" });
    });
};
