const { UserModel, BookingsModel, RoleModel } = require('../models')
const { Op } = require('../config').Sequelize

const getBookingById = async (id) => await BookingsModel.findOne({
    where: {
        deleted: false,
        id
    }
})
const deleteBookingById = async (id) => await BookingsModel.update({
    deleted: true
}, { where: { id } })
const getAllBookingsByUserId = async ({ id, limit, offset }) => await BookingsModel.findAndCountAll({
    where: {
        deleted: false,
        [Op.or]: [
            { coachId: id },
            { gymnastId: id }
        ],
        time: {
            [Op.gt]: new Date()
        }
    },
    attributes: ['id', 'time'],
    include: [
        {
            model: UserModel,
            attributes: ['id', 'firstName', 'userName', 'lastName'],
            as: 'coach',
            where: {
                deleted: false,
            }
        },
        {
            model: UserModel,
            as: 'gymnast',
            attributes: ['id', 'firstName', 'userName', 'lastName'],
            where: {
                deleted: false,
            }
        },
    ],
    order: [
        ["id", "DESC"]
    ],
    limit,
    offset,
})
const createBooking = async (data) => await BookingsModel.create({ ...data })
const getCoachById = async (coachId) => await UserModel.findOne({
    where: {
        deleted: false,
        id: coachId
    },
    include: [
        {
            model: RoleModel,
            where: { name: "coach" }
        }
    ]
})
module.exports = { getBookingById, getCoachById, createBooking, deleteBookingById, getAllBookingsByUserId }