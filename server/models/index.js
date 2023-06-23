const { sequelize, Sequelize } = require("./../config");

// Initialize Models
const UserModel = require("./users")(sequelize, Sequelize);
const UsersTokensModel = require("./user_tokens")(sequelize, Sequelize);
const BasicTokensModel = require("./basic_tokens")(sequelize, Sequelize);
const RoleModel = require("./role")(sequelize, Sequelize);
const StatesModel = require("./states")(sequelize, Sequelize);
const CityModel = require("./city")(sequelize, Sequelize);
const GymModel = require("./gym")(sequelize, Sequelize);
const TimeTableModel = require("./time_table")(sequelize, Sequelize);
const PermissionModel = require("./permission")(sequelize, Sequelize);
const BookingsModel = require("./bookings")(sequelize, Sequelize);
const ScheduleModel = require("./coach_schedule")(sequelize, Sequelize);
// Add associations
UserModel.hasMany(UsersTokensModel, { foreignKey: "user_id" });
UserModel.hasMany(BookingsModel, { foreignKey: "gymnast_id" });
UserModel.hasMany(BookingsModel, { foreignKey: "coach_id" });
UserModel.hasMany(ScheduleModel, { foreignKey: "coach_id" });
UserModel.belongsToMany(RoleModel, {
  through: "user_roles",
  foreignKey: "user_id",
  timestamps: false,
});
BookingsModel.belongsTo(UserModel, { as: "coach", foreignKey: "coach_id" });
BookingsModel.belongsTo(UserModel, { as: "gymnast", foreignKey: "gymnast_id" });

UsersTokensModel.belongsTo(UserModel, { foreignKey: "user_id" });
PermissionModel.belongsToMany(RoleModel, {
  through: "role_permissions",
  foreignKey: "permissionId",
});
RoleModel.belongsToMany(PermissionModel, {
  through: "role_permissions",
  foreignKey: "role_id",
});
UserModel.belongsToMany(RoleModel, {
  through: "user_roles",
  foreignKey: "user_id",
  timestamps: false,
});
CityModel.belongsTo(StatesModel, {
  foreignKey: "state_id",
});
GymModel.belongsTo(CityModel, {
  foreignKey: "city_id",
});
TimeTableModel.belongsTo(UserModel, { foreignKey: "coach_id" });
UserModel.hasMany(TimeTableModel, { foreignKey: "coach_id" });
// sequelize.sync().then(() => {
//     console.log('Database Synchronized')
// })
module.exports = {
  UserModel,
  UsersTokensModel,
  BasicTokensModel,
  RoleModel,
  PermissionModel,
  BookingsModel,
  ScheduleModel,
  StatesModel,
  CityModel,
  GymModel,
  TimeTableModel,
};
