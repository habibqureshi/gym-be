const { getAvailableCoach, getCoachById } = require('../../services/coach.service');
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
        return res.status(200).json({ total: coaches.count, limit, currentPage: page, data: coaches.rows })
    } catch (error) {
        next(error)
    }
}
