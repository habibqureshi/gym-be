const Sequelize = require("sequelize");
const config = require("./config");

console.log(
  config.database,
  process.env.USER || config.username,
  process.env.PASSWORD || config.password,
  {
    dialect: config.dialect,
    host: config.host,
    pool: {
      ...config.pool,
    },
    logging: console.log,
  }
);

const sequelize = new Sequelize(
  config.database,
  process.env.DB_USER || config.username,
  process.env.DB_PASSWORD || config.password,
  {
    dialect: config.dialect,
    host: config.host,
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
