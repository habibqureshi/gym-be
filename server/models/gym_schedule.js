module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  const GymSchedule = sequelize.define(
    "gym_schedule",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      gymId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      from: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      to: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      // define the table's name
      tableName: "gym_schedule",
    }
  );
  return GymSchedule;
};
