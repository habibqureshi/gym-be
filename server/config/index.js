const Sequelize = require('sequelize');
const config = require('./config')

const sequelize = new Sequelize(
    process.env.db_name || config.database,
    process.env.db_username || config.username,
    process.env.db_password || config.password,
    {
        dialect: config.dialect,
        host: process.env.db_host || config.host,
        pool: {
            ...config.pool
        },
        logging: true,
    }
)
module.exports = {
    sequelize,
    Sequelize
}
