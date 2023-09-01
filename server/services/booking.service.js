const { UserModel, BookingsModel, RoleModel, Children } = require("../models");
const { Op } = require("../config").Sequelize;
const { Sequelize } = require("../config/index");
const children = require("../models/children");

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

const getBookingByChildrenIds = async ({ childrenId, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      childrenId: childrenId,
      status: {
        [Op.ne]: "REJECT",
      },
    },
    include: [
      {
        model: UserModel,
        attributes: ["firstName", "userName", "lastName"],
        as: "coach",
      },
      {
        model: Children,
        attributes: ["name"],
        as: "children",
      },
    ],
    // raw: true,
    order: [["id", "DESC"]],
    limit,
    offset,
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

const getBookingByCoachIdAndDateRange = async (coachId, startDate, endDate) => {
  const bookings = await BookingsModel.findAll({
    where: {
      deleted: false,
      coachId,
      from: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
      status: {
        [Op.notIn]: ["REJECT", "CANCEL"],
      },
    },
    raw: true,
  });

  return bookings;
};

const getBookingsByDateRange = async (startDate, endDate) => {
  const bookings = await BookingsModel.findAll({
    where: {
      deleted: false,
      from: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
      status: {
        [Sequelize.Op.notIn]: ["REJECT", "CANCEL"],
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

const getBookings = async ({ id, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      coachId: id,
    },
    order: [["id", "DESC"]],
    limit,
    offset,
  });

const getAllBookingsByUserId = async ({ id, limit, offset }) =>
  await BookingsModel.findAndCountAll({
    where: {
      deleted: false,
      [Op.or]: [{ coachId: id }],
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
        model: Children,
        attributes: ["id", "name"],
        as: "children",
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
  getBookingByCoachIdAndDateRange,
  updateBookingStatus,
  getBookings,
  getBookingByChildrenIds,
  getBookingsByDateRange,
};
