module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes
    const Role = sequelize.define("user_roles",
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
            roleId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
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
            timestamps: false,
            freezeTableName: true,
            // define the table's name
            tableName: 'user_roles'
        }
    );

    return Role;

}