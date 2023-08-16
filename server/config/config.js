// // localhost
const config = {
  host: "34.172.42.56",
  port: 3306,
  database: "gym",
  username: "gym",
  password: "mOC%;%5dTpAUo{pT",
};

module.exports = {
  ...config,
  dialect: "mysql",
  define: {
    timestamps: false,
  },
  pool: {
    max: 5,
    mind: 0,
    acquire: 30000,
    idle: 10000,
  },
};
