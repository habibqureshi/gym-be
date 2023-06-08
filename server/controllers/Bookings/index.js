const { sequelize } = require('../../config');
const { getBookingById, deleteBookingById, createBooking, getCoachById } = require('../../services/booking.service');
const { getOffset } = require('../../utils/helpers/helper')
const myBookings = async (req, res, next) => {
    try {
        const { currentUser } = req;
        let { page = 1, limit = 10 } = req.query;
        limit = +limit; page = +page
        const offset = getOffset({ limit, page })
        const bookings = await getAllBookingsByUserId({ id: currentUser.id, limit, offset })
        if (bookings.length === 0) {
            return res.status(200).json({ message: "No Data Found" })
        }
        return res.status(200).json({ total: bookings.count, limit: limit, currentPage: page, data: bookings.rows })
    } catch (error) {
        next(error)
    }
}

const createBooking = async (req, res, next) => {
    try {
        const { currentUser } = req;
        const { time, coachId } = req.body
        if (coachId === currentUser.id) {
            return res.status(400).json({ message: "Can't Create Booking with self" })
        }
        if (!(coachId && time)) {
            return res.status(400).json({ message: "Invalid Request Parameters" })
        }
        const coach = await getCoachById(coachId)

        if (coach === null) {
            return res.status(400).json({ message: "Coach Not Found" })
        }
        const transaction = await sequelize.transaction(async t => {
            const newBooking = await createBooking({
                gymnastId: currentUser.id,
                coachId,
                time
            })
            return {
                id: newBooking.dataValues.id,
                time: newBooking.dataValues.time,
                coach: {
                    id: coach.dataValues.id,
                    userName: coach.dataValues.userName,
                    firstName: coach.dataValues.firstName,
                    lastName: coach.dataValues.lastName,
                    image: coach.dataValues.image
                },
            }
        })
        return res.status(201).json(transaction)
    } catch (error) {
        next(error)
    }
}
const deleteBooking = async (req, res, next) => {
    try {
        const { currentUser } = req
        const { id } = req.query
        if (!id) {
            return res.status(400).json({ message: "Invalid Record Id" })
        }
        const booking = await getBookingById(id)
        if (booking === null) {
            return res.status(400).json({ message: "Booking Not Found" })
        }
        if (booking.dataValues.gymnastId !== currentUser.id) {
            return res.status(401).json({ message: "You are not authorized to delete this booking" })
        }
        await sequelize.transaction(async t => {
            return await deleteBookingById(id)
        })
        return res.status(201).json({ message: `booking deleted success with id : ${id}` })
    } catch (error) {
        next(error)
    }
}
module.exports = { myBookings, createBooking, deleteBooking }