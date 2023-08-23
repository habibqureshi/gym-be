const {
  getStatesBySize,
  getAllStates,
  getStateById,
  createStates,
  updateState,
} = require("../../services/states.service");
const { getOffset } = require("../../utils/helpers/helper");
const { sequelize } = require("../../config");

exports.getStates = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const state = await getStateById(id);
      if (!state) {
        return res.sendStatus(204);
      }
      return res.status(200).json(state);
    }
    let states;
    const { size } = req.query;
    if (size) {
      let { page = 1, limit = 10 } = req.query;
      limit = +limit;
      page = +page;
      const offset = getOffset({ limit, page });
      states = await getStatesBySize({ limit, offset });
      if (states.count === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: states.count,
        limit,
        currentPage: page,
        data: states.rows,
      });
    } else {
      states = await getAllStates();
      if (states.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: states.length,
        data: states,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.createNewState = async (req, res, next) => {
  try {
    const { name, enable } = req.body;
    if (!name) {
      console.log("Invalid State Name");
      return res.status(400).json({ message: "Invalid State Name" });
    }
    const transaction = await sequelize.transaction(async (t) => {
      const newState = await createStates({ name });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateState = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.query;
    if (!name || name === "") {
      console.log("Invalid State Name");
      return res.status(400).json({ message: "Invalid State Name" });
    }
    const transaction = await sequelize.transaction(async (t) => {
      const result = await updateState(id, { name });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteState = async (req, res, next) => {
  try {
    const { id } = req.query;
    const transaction = await sequelize.transaction(async (t) => {
      let enable = false,
        deleted = true;
      const result = await updateState(id, { enable, deleted });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};
