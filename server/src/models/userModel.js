const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

// Model for User data
exports.UserModel = sequelize.define('users', {
  // rc extension id
  id: {
    type: Sequelize.NUMBER,
    primaryKey: true,
  },
  accountId: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  firebaseToken: {
    type: Sequelize.STRING,
  },
  // platform + doc id
  sessionId: {
    type: Sequelize.STRING,
  }
});
