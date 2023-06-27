const { GymModel, CityModel, StateModel } = require("../models");

exports.getGymBySize = async ({ limit, offset }) =>
  await GymModel.findAndCountAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: CityModel,
        attributes: ["id", "name"],
      },
    ],
    order: ["id"],
    limit,
    offset,
  });

exports.getAllGym = async () =>
  await GymModel.findAll({
    where: {
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    order: ["id"],
    raw: true,
  });

exports.getGymByCityId = async (id) =>
  await GymModel.findAll({
    where: {
      city_id: id,
      deleted: false,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: CityModel,
        attributes: ["id", "name"],
      },
    ],
    order: ["id"],
    raw: true,
  });

exports.getGymById = async (id) =>
  await GymModel.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: ["id", "name", "enable", "deleted", "createdAt", "updatedAt"],
    include: [
      {
        model: CityModel,
        attributes: ["id", "name"],
      },
    ],
  });

exports.createGym = async (data) => await GymModel.create({ ...data });

exports.updateGym = async (id, data) =>
  await GymModel.update(data, { where: { id } });
