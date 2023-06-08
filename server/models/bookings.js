module.exports = (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize
    const Bookings = sequelize.define("bookings",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            gymnastId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                min: 1,
                max: 500
            },
            coachId: {
                type: DataTypes.INTEGER(11),
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
            time: {
                type: DataTypes.DATE,
                allowNull: false,
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
            tableName: 'bookings'
        }
    );
    return Bookings;

}