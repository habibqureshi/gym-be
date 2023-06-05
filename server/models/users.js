module.exports = (sequelize, Sequelize) => {
    const Tutorial = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING(100)
        },
        password: {
            type: Sequelize.BOOLEAN
        },
        enable: {
            type: Sequelize.BOOLEAN
        },
        deleted: {
            type: Sequelize.BOOLEAN
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        tableName: "users",
        underscored: true
    });

    return Tutorial;
};