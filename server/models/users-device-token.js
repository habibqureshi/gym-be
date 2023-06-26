module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    return sequelize.define("device_tokens",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
            },
            deviceToken: {
                type: DataTypes.STRING(500),
                allowNull: false
            },
            enable: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            underscored: true,
            timestamps: true,
            freezeTableName: true,
            // define the table's name
            tableName: 'device_tokens'
        }
    );
}