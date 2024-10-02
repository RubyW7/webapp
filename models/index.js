// models/index.js
const User = require('./user')(sequelize, Sequelize.DataTypes);

module.exports = {
    User
};
