// // localhost
const config = {
  host: "localhost",
  port: 3306,
  database: "gym",
  username: "root",
  password: "Password_2547422",
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
