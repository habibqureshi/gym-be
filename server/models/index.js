const { sequelize, Sequelize } = require("./../config");

const User = require('./users')
const UsersTokens = require('./user_tokens')
const BasicTokens = require('./basic_tokens')

const UserModel = User(sequelize, Sequelize);
const UsersTokensModel = UsersTokens(sequelize, Sequelize);
const BasicTokensModel = BasicTokens(sequelize, Sequelize);

UserModel.hasMany(UsersTokensModel, { foreignKey: "user_id" })
UsersTokensModel.belongsTo(UserModel, { foreignKey: "user_id" })

sequelize.sync().then(res => {
    console.log('Database Synchronized')
})
module.exports = {
    UserModel,
    UsersTokensModel,
    BasicTokensModel
};