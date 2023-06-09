module.exports = (sequelize, Sequelize) => {
    const { DataTypes } = Sequelize
    const CoachSchedule = sequelize.define("coach_schedule",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            coachId: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: "SYSTEM",
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(50),
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
            timestamps: true,
            freezeTableName: true,
            // define the table's name
            tableName: 'coach_schedule'
        }
    );
    return CoachSchedule;

}