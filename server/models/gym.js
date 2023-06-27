module.exports = (sequelize, Sequelize) => {
  const Gym = sequelize.define(
    "gym",
    {
      id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      enable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "gym",
      underscored: true,
    }
  );
  return Gym;
};