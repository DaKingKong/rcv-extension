const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

// Model for Session data
exports.SessionModel = sequelize.define('sessions', {
  // platform + doc id
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  active: {
    type: Sequelize.BOOLEAN
  },
  meetingId: {
    type: Sequelize.STRING
  }
});
