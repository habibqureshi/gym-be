const { StatesModel } = require("../models");

exports.getStatesBySize = async ({ limit, offset }) =>
  await StatesModel.findAndCountAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    order: ["id"],
    limit,
    offset,
  });

exports.getAllStates = async () =>
  await StatesModel.findAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    order: ["id"],
    raw: true,
  });

exports.getStateById = async (id) =>
  await StatesModel.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
  });
