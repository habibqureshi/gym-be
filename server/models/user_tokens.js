module.exports = (sequelize, Sequelize) => {
    const UsersTokens = sequelize.define("user_tokens",
        {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
            },
            userName: {
                type: Sequelize.STRING(200),
                allowNull: false,
                min: 1,
                max: 200
            },
            deviceInfo: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            token: {
                type: Sequelize.STRING(255),
                allowNull: false,
                min: 1,
                max: 255
            },
        },
        {
            underscored: true,
            freezeTableName: false,
            // define the table's name
            tableName: 'user_tokens',
            timestamps: true
        }
    );

    return UsersTokens;
}