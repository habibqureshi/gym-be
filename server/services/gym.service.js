const {
  GymModel,
  CityModel,
  StateModel,
  GymScheduleModel,
} = require("../models");
const { Sequelize } = require("../config/index");

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

exports.saveSchedule = async (data) =>
  await GymScheduleModel.create({
    ...data,
  });

exports.existsScheduleForGymAndDate = async function (gymId, from) {
  const existingSchedule = await GymScheduleModel.findAll({
    where: {
      gymId: gymId,
      from: {
        [Sequelize.Op.gte]: from + " 00:00:00", // Start of the fromDate (00:00:00 time)
        [Sequelize.Op.lt]: from + " 23:59:59", // End of the fromDate (23:59:59 time)
      },
    },
    raw: true,
  });
  return existingSchedule;
};

exports.existsScheduleForGym = async function (gymId) {
  const existingSchedule = await GymScheduleModel.findAll({
    where: {
      gymId: gymId,
    },
  });
  return existingSchedule;
};
