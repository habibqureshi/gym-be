const { UserModel, BookingsModel, RoleModel } = require("../models");
const { Op } = require("../config").Sequelize;
const { Sequelize } = require("../config/index");

const getBookingById = async (id) =>
  await BookingsModel.findOne({
    where: {
      id,
    },
    raw: true,
  });

const updateBookingStatus = async (id, booking_status) =>
  await BookingsModel.update(
    {
      status: booking_status,
    },
    { where: { id } }
  );

const getBookingByCoachId = async (coachId) =>
  await BookingsModel.findAll({
    where: {
      deleted: false,
      coachId,
      status: {
        [Op.ne]: "REJECT",
      },
    },
    raw: true,
  });

const getBookingByCoachIdAndDate = async (coachId, date) => {
  const bookings = await BookingsModel.findAll({
    where: {
      deleted: false,
      coachId,
      from: {
        [Sequelize.Op.gte]: date + " 00:00:00", // Start of the fromDate (00:00:00 time)
        [Sequelize.Op.lt]: date + " 23:59:59", // End of the fromDate (23:59:59 time)
      },
      status: {
        [Op.notIn]: ["REJECT", "CANCEL"],
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

const getBookings = async ({ limit, offset }) => {
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
    },
    order: [["id", "DESC"]],
    limit,
    offset,
  });
};

const getAllBookingsByUserId = async ({ id, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      [Op.or]: [{ coachId: id }, { gymnastId: id }],
    },
    attributes: ["id", "to", "from", "status"],
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
  updateBookingStatus,
  getBookings,
};
