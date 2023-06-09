const { RoleModel, UserModel, ScheduleModel } = require("../models");

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
exports.saveSchedule = async (data) => await ScheduleModel.create({
    ...data
})
exports.getMySchedules = async ({ limit, offset, id }) => await ScheduleModel.findAndCountAll({
    where: {
        coachId: id,
        deleted: false
    },
    include: [
        {
            model: UserModel,
            attributes: ['name', 'userName', 'image'],
            where: { deleted: false }
        }
    ],
    limit,
    offset
})