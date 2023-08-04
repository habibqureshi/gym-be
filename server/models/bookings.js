module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  const Bookings = sequelize.define(
    "bookings",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      childrenId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      coachId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "SYSTEM",
      },
      to: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      from: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      // define the table's name
      tableName: "bookings",
    }
  );
  return Bookings;
};
