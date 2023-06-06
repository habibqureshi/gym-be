"use strict"
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        userName: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        image: {
            type: Sequelize.STRING(500),
            allowNull: true
        },
        enable: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        tableName: "users",
        underscored: true
    });

    return User;
};