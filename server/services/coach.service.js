const { RoleModel, UserModel } = require("../models");

exports.getAvailableCoach = async ({ limit, offset }) => await UserModel.findAndCountAll({
    where: {
        deleted: false,
    },
    attributes: ['id', 'userName', 'firstName', 'lastName', 'phoneNumber', 'image'],
    include: [
        {
            model: RoleModel,
            attributes: ['id', 'name'],
            where: { name: "coach", deleted: false }
        }
    ],
    order: ['id'],
    limit,
    offset
})
exports.getCoachById = async (id) => await UserModel.findOne({
    where: {
        deleted: false,
        id
    },
    attributes: ['id', 'userName', 'firstName', 'lastName', 'phoneNumber', 'image'],

    include: [
        {
            model: RoleModel,
            attributes: ['id', 'name'],
            where: { name: "coach" }
        }
    ]
})
