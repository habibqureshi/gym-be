const {
  getAllGym,
  getGymByCityId,
  getGymBySize,
  getGymById,
  createGym,
  updateGym,
} = require("../../services/gym.service");
const { getCityById } = require("../../services/city.service");
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

exports.createNewGym = async (req, res, next) => {
  try {
    const { name, cityId } = req.body;
    if (!name || cityId === 0) {
      console.log("Invalid Gym Name or City ");
      return res.status(400).json({ message: "Invalid Gym Name or City" });
    }
    const city = await getCityById(cityId);
    if (!city) {
      console.log("City Not Found");
      return res.status(400).json({ message: "City Not Found" });
    }
    console.log("City found");
    const transaction = await sequelize.transaction(async (t) => {
      const newGym = await createGym({ name, cityId });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGym = async (req, res, next) => {
  try {
    const { name, cityId } = req.body;
    const { id } = req.query;
    if (!name || name === "") {
      console.log("Invalid Gym Name");
      return res.status(400).json({ message: "Invalid Gym Name" });
    }
    const transaction = await sequelize.transaction(async (t) => {
      if (cityId && cityId != 0) {
        const city = await getCityById(stateId);
        if (!city) {
          console.log("City Not Found");
          return res.status(400).json({ message: "City Not Found" });
        }
        console.log("city found");
        const result = await updateGym(id, { name, cityId });
      } else {
        const result = await updateGym(id, { name });
      }
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteGym = async (req, res, next) => {
  try {
    const { id } = req.query;
    const transaction = await sequelize.transaction(async (t) => {
      let enable = false,
        deleted = false;
      const result = await updateGym(id, { enable, deleted });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};
