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

exports.createStates = async (data) => await StatesModel.create({ ...data });

exports.updateState = async (id, data) =>
  await StatesModel.update(data, { where: { id } });
