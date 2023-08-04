const {
  RoleModel,
  UserModel,
  ScheduleModel,
  TimeTableModel,
} = require("../models");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("./time_table.service");
const { getBookingByCoachIdAndDate } = require("./booking.service");
const { Op } = require("../config").Sequelize;

exports.getAvailableCoach = async ({ limit, offset }) =>
  await UserModel.findAndCountAll({
    where: {
      deleted: false,
    },
    attributes: [
      "id",
      "userName",
      "firstName",
      "lastName",
      "phoneNumber",
      "image",
    ],
    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: { name: "coach", deleted: false },
      },
    ],
    order: ["id"],
    limit,
    offset,
  });
exports.getCoachById = async (id) =>
  await UserModel.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: [
      "id",
      "userName",
      "firstName",
      "lastName",
      "phoneNumber",
      "image",
      "private",
      "status",
      "gymId",
    ],

    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: { name: "coach" },
      },
    ],
    raw: true,
  });
exports.getPrivateCoach = async () =>
  await UserModel.findAll({
    where: {
      deleted: false,
      private: true,
    },
    attributes: [
      "id",
      "userName",
      "firstName",
      "lastName",
      "phoneNumber",
      "image",
      "private",
      "status",
    ],
    raw: true,
  });
exports.saveSchedule = async (data) =>
  await ScheduleModel.create({
    ...data,
  });
exports.getMySchedules = async ({ limit, offset, id }) =>
  await ScheduleModel.findAndCountAll({
    where: {
      coachId: id,
      deleted: false,
    },
    include: [
      {
        model: UserModel,
        attributes: ["name", "userName", "image"],
        where: { deleted: false },
      },
    ],
    limit,
    offset,
  });

exports.addCoachPrivateSlots = async (
  coach,
  from,
  to,
  scheduleType,
  createdBy
) => {
  try {
    console.log("coach id: ", coach, from, to, scheduleType);
    let time = {
      to,
      from,
      type: scheduleType,
      enable: true,
      deleted: false,
      coachId: coach,
      createdBy: createdBy,
    };

    return await TimeTableModel.create({ ...time });
  } catch (error) {
    console.log(error);
  }
};

exports.getPublicSlots = async (coach) => {
  console.log("coach id: ", coach);
  return await getTimeTableByCoachIdAndType(coach, "PUBLIC");
};

exports.getCoachSchedule = async (id, start, end) => {
  return await TimeTableModel.findAll({
    where: {
      coachId: id,
      from: {
        [Op.between]: [`${start} 00:00:00`, `${end} 23:59:59`],
      },
      to: {
        [Op.between]: [`${start} 00:00:00`, `${end} 23:59:59`],
      },
    },
    raw: true,
  });
};

exports.getCoachScheduleById = async (id, coachId) => {
  return await TimeTableModel.findAll({
    where: {
      id,
      coachId: coachId,
    },
    raw: true,
  });
};

exports.deleteCoachScheduleById = async (id, coachId) => {
  return await TimeTableModel.destroy({
    where: {
      id,
      coachId: coachId,
    },
  }).then((rowsDeleted) => {
    if (rowsDeleted === 0) {
      console.log("TimeTable not found.");
    } else {
      console.log("TimeTable deleted successfully.");
    }
  });
};

exports.getCoachBookingsByDate = async (coach, date) => {
  console.log("coach id: ", coach);
  return await getBookingByCoachIdAndDate(coach, date);
};
