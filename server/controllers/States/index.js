const {
  getStatesBySize,
  getAllStates,
  getStateById,
} = require("../../services/states.service");
const { getOffset } = require("../../utils/helpers/helper");

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
