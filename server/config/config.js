// // localhost
const config = {
  host: "localhost",
  database: "gym",
  username: "root",
  password: "Password_123",
}

module.exports = {
  ...config,
  dialect: 'mysql',
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
