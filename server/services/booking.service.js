const { UserModel, BookingsModel, RoleModel } = require("../models");
const { Op } = require("../config").Sequelize;

const getBookingById = async (id) =>
  await BookingsModel.findOne({
    where: {
      deleted: false,
      id,
    },
  });

const getBookingByCoachId = async (coachId) =>
  await BookingsModel.findAll({
    where: {
      deleted: false,
      coachId,
    },
    raw: true,
  });

const getBookingByCoachIdAndDate = async (coachId, date) => {
  console.log(coachId, date);
  const formattedDate = new Date(
    `${date.slice(6, 10)}-${date.slice(3, 5)}-${date.slice(0, 2)}`
  );
  const formattedDateISOString = formattedDate.toISOString();

  const bookings = await BookingsModel.findAll({
    where: {
      deleted: false,
      coachId,
      from: {
        [Op.gte]: formattedDateISOString,
        [Op.lt]: new Date(
          formattedDate.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    },
    raw: true,
  });

  return bookings;
};

const deleteBookingById = async (id) =>
  await BookingsModel.update(
    {
      deleted: true,
    },
    { where: { id } }
  );
const getAllBookingsByUserId = async ({ id, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      [Op.or]: [{ coachId: id }, { gymnastId: id }],
    },
    attributes: ["id", "to", "from"],
    include: [
      {
        model: UserModel,
        attributes: ["id", "firstName", "userName", "lastName"],
        as: "coach",
        where: {
          deleted: false,
        },
      },
      {
        model: UserModel,
        as: "gymnast",
        attributes: ["id", "firstName", "userName", "lastName"],
        where: {
          deleted: false,
        },
      },
    ],
    order: [["id", "DESC"]],
    limit,
    offset,
  });

const getAllBookingsByGymnastId = async ({ id, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      gymnastId: id,
    },
    attributes: ["id", "time"],
    include: [
      {
        model: UserModel,
        attributes: ["id", "firstName", "userName", "lastName"],
        as: "coach",
        where: {
          deleted: false,
        },
      },
      {
        model: UserModel,
        as: "gymnast",
        attributes: ["id", "firstName", "userName", "lastName"],
        where: {
          deleted: false,
        },
      },
    ],
    order: [["id", "DESC"]],
    limit,
    offset,
  });
const createBooking = async (data) => await BookingsModel.create({ ...data });

module.exports = {
  getBookingById,
  createBooking,
  deleteBookingById,
  getAllBookingsByUserId,
  getBookingByCoachId,
  getBookingByCoachIdAndDate,
  getAllBookingsByGymnastId,
};
