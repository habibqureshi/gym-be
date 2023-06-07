module.exports = (sequelize, Sequelize) => {
    const BasicTokens = sequelize.define("basic_tokens",
        {
            clientId: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            clientSecret: {
                type: Sequelize.STRING(200),
                allowNull: false,
                min: 1,
                max: 200
            },
        },
        {
            underscored: true,
            freezeTableName: false,
            // define the table's name
            tableName: 'basic_tokens',
            timestamps: false
        }
    );
    return BasicTokens;
}