const Sequelize = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(
  process.env.DB || config.database,
  process.env.USER || config.username,
  process.env.PASSWORD || config.password,
  {
    dialect: config.dialect,
    host: process.env.HOST || config.host,
    pool: {
      ...config.pool,
    },
    logging: console.log,
  }
);
module.exports = {
  sequelize,
  Sequelize,
};
