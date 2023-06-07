const { UserModel, BookingsModel, RoleModel } = require('../models')
const getBookingById = async (id) => await BookingsModel.findOne({
    where: {
        deleted: false,
        id
    }
})
const deleteBookingById = async (id) => await BookingsModel.update({
    deleted: true
}, { where: { id } })

module.exports = { getBookingById, deleteBookingById }