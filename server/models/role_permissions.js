module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes

    const RolePermissions = sequelize.define("role_permissions",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            roleId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            permissionId: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            }
        },
        {
            underscored: true,
            timestamps: false,
            freezeTableName: true,
            // define the table's name
            tableName: 'role_permissions'
        }
    );

    return RolePermissions;

}