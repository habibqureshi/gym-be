const Sequelize = require("sequelize");
const config = require("./config");

console.log(config.database, config.username, config.password, {
  dialect: config.dialect,
  host: config.host,
  pool: {
    ...config.pool,
  },
  logging: console.log,
});

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
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
