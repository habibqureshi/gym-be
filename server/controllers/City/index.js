const {
  getCititesBySize,
  getAllCities,
  getCityById,
  getCitiesByStateId,
} = require("../../services/city.service");
const { getOffset } = require("../../utils/helpers/helper");

exports.getCities = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const city = await getCityById(id);
      if (!city) {
        return res.sendStatus(204);
      }
      return res.status(200).json(city);
    }
    let cities;
    const { state } = req.query;
    if (state) {
      console.log("finding city by state: ", state);
      cities = await getCitiesByStateId(state);
      console.log(cities);
      if (cities.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: cities.length,
        data: cities,
      });
    }
    const { size } = req.query;
    if (size) {
      let { page = 1, limit = 10 } = req.query;
      limit = +limit;
      page = +page;
      const offset = getOffset({ limit, page });
      cities = await getCititesBySize({ limit, offset });
      if (cities.count === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: cities.count,
        limit,
        currentPage: page,
        data: cities.rows,
      });
    } else {
      cities = await getAllCities();
      if (cities.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: cities.length,
        data: cities,
      });
    }
  } catch (error) {
    next(error);
  }
};
