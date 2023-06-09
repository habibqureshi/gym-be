const { getAvailableCoach, getCoachById, saveSchedule, getMySchedules } = require('../../services/coach.service');
const { getOffset } = require('../../utils/helpers/helper');

exports.getAllCoach = async (req, res, next) => {
    try {
        const { id } = req.query
        if (id) {
            const coach = await getCoachById(id)
            if (!coach) {
                return res.sendStatus(204)//.json({ message: "No Record Found", data: {} })
            }
            return res.status(200).json(coach)
        }
        let { page = 1, limit = 10 } = req.query;
        limit = +limit; page = +page
        const offset = getOffset({ limit, page })
        const coaches = await getAvailableCoach({ limit, offset })
        if (coaches.count === 0) {
            return res.statusCode(204)//.json({ total: coaches.count, limit, currentPage: page, message: "No Data Found" })
        }
        return res.status(200).json({ total: coaches.count, limit, currentPage: page, data: coaches.rows })
    } catch (error) {
        next(error)
    }
}
exports.saveSchedule = async (req, res, next) => {
    try {
        const { startTime, endTime, type } = req.body
        const { currentUser } = req
        const { id: coachId } = currentUser
        const newSchedule = await saveSchedule({ coachId, startTime, endTime, type })
        return res.status(201).json({ newSchedule, message: "Schedule Created" })
    } catch (error) {
        next(error)
    }
}
exports.getMySchedule = async (req, res, next) => {
    try {
        const { currentUser } = req
        let { page = 1, limit = 10 } = req.query;
        limit = +limit; page = +page
        const offset = getOffset({ limit, page })
        const mySchedules = await getMySchedules({ limit, offset, id: currentUser.id })
        if (mySchedules.count === 0) {
            return res.statusCode(204)//.json({ total: mySchedules.count, limit, currentPage: page, message: "No Saved Schedules Found" })
        }
        return res.status(200).json({ total: mySchedules.count, limit, currentPage: page, data: mySchedules.rows })
    } catch (error) {
        next(error)
    }
}
