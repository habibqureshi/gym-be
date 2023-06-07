const { UserModel, BookingsModel } = require('../../models')
const { Op } = require('../../config').Sequelize
const myBookings = async (req, res, next) => {
    try {
        const { currentUser } = req
        const bookings = await BookingsModel.findAll({
            where: {
                deleted: false,
                [Op.or]: [
                    { coachId: currentUser.id },
                    { gymnastId: currentUser.id }
                ],
                time: {
                    $gt: new Date()
                }
            },
            include: [
                {
                    model: UserModel,
                    as: "gymnast",
                    attributes: ['id', 'firstName', 'userName', 'lastName'],
                    where: {
                        deleted: false,
                        gymnastId
                    }
                },
                {
                    model: UserModel,
                    as: "coach",
                    attributes: ['id', 'firstName', 'userName', 'lastName'],
                    where: {
                        deleted: false,
                        coachId
                    }
                }
            ],
            order: [
                ["id", "DESC"]
            ],
        })
        if (!bookings) {
            return res.status(204).json({ message: "No Data Found" })
        }
        return res.status(200).json(bookings)
    } catch (error) {
        next(error)
    }
}
module.exports = { myBookings }