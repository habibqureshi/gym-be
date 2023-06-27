const {
  getCititesBySize,
  getAllCities,
  getCityById,
  getCitiesByStateId,
  createCity,
  updateCity,
} = require("../../services/city.service");
const { getStateById } = require("../../services/states.service");
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

exports.createNewCity = async (req, res, next) => {
  try {
    const { name, stateId } = req.body;
    if (!name || stateId === 0) {
      console.log("Invalid City Name or State ");
      return res.status(400).json({ message: "Invalid City Name or State" });
    }
    const state = await getStateById(stateId);
    if (!state) {
      console.log("State Not Found");
      return res.status(400).json({ message: "State Not Found" });
    }
    console.log("state found");
    const transaction = await sequelize.transaction(async (t) => {
      const newCity = await createCity({ name, stateId });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCity = async (req, res, next) => {
  try {
    const { name, stateId } = req.body;
    const { id } = req.query;
    if (!name || name === "") {
      console.log("Invalid City Name");
      return res.status(400).json({ message: "Invalid City Name" });
    }
    const transaction = await sequelize.transaction(async (t) => {
      if (stateId && stateId != 0) {
        const state = await getStateById(stateId);
        if (!state) {
          console.log("State Not Found");
          return res.status(400).json({ message: "State Not Found" });
        }
        console.log("state found");
        const result = await updateCity(id, { name, stateId });
      } else {
        const result = await updateCity(id, { name });
      }
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCity = async (req, res, next) => {
  try {
    const { id } = req.query;
    const transaction = await sequelize.transaction(async (t) => {
      let enable = false,
        deleted = true;
      const result = await updateCity(id, { enable, deleted });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};
