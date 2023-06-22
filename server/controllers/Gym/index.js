const {
  getAllGym,
  getGymByCityId,
  getGymBySize,
  getGymById,
} = require("../../services/gym.service");
const { getOffset } = require("../../utils/helpers/helper");

exports.getGym = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const gym = await getGymById(id);
      if (!gym) {
        return res.sendStatus(204);
      }
      return res.status(200).json(gym);
    }
    let gyms;
    const { city } = req.query;
    if (city) {
      console.log("finding gym by city: ", city);
      gyms = await getGymByCityId(city);
      console.log(gyms);
      if (gyms.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.length,
        data: gyms,
      });
    }
    const { size } = req.query;
    if (size) {
      let { page = 1, limit = 10 } = req.query;
      limit = +limit;
      page = +page;
      const offset = getOffset({ limit, page });
      gyms = await getGymBySize({ limit, offset });
      if (gyms.count === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.count,
        limit,
        currentPage: page,
        data: gyms.rows,
      });
    } else {
      gyms = await getAllGym();
      if (gyms.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.length,
        data: gyms,
      });
    }
  } catch (error) {
    next(error);
  }
};
