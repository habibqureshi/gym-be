const { CityModel, StatesModel } = require("../models");

exports.getCititesBySize = async ({ limit, offset }) =>
  await CityModel.findAndCountAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: StatesModel,
        attributes: ["id", "name"],
      },
    ],
    order: ["id"],
    limit,
    offset,
  });

exports.getAllCities = async () =>
  await CityModel.findAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    order: ["id"],
    raw: true,
  });

exports.getCitiesByStateId = async (id) =>
  await CityModel.findAll({
    where: {
      state_id: id,
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: StatesModel,
        attributes: ["id", "name"],
      },
    ],
    order: ["id"],
    raw: true,
  });

exports.getCityById = async (id) =>
  await CityModel.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: StatesModel,
        attributes: ["id", "name"],
      },
    ],
  });
