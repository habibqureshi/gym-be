module.exports = (sequelize, Sequelize) => {
  const DataTypes = Sequelize.DataTypes;
  const Notification = sequelize.define(
    "notification",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      firebaseMessageId: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      targetSystem: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      deviceToken: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      actionPayload: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
      tableName: "notification",
    }
  );
  return Notification;
};
