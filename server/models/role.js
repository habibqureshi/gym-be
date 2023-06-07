module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    const Role = sequelize.define("roles",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(500),
                allowNull: false,
                min: 1,
                max: 500
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: "SYSTEM",
                min: 1,
                max: 100
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
            tableName: 'roles'
        }
    );

    return Role;

}