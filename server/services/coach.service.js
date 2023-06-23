const {
  RoleModel,
  UserModel,
  ScheduleModel,
  TimeTableModel,
} = require("../models");
const { getTimeTableByCoachIdAndType } = require("./time_table.service");
const { getBookingByCoachIdAndDate } = require("./booking.service");

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

exports.updateCoachPrivateSlots = async (coach, privateTime) => {
  console.log("coach id: ", coach);
  console.log("priateTime: ", privateTime);
  let time = {
    to: privateTime.privateToTime,
    from: privateTime.privateFromTime,
    type: "PRIVATE",
    enable: true,
    deleted: false,
    coachId: coach,
    createdBy: "COACH",
  };
  let existPrivateTime = await getTimeTableByCoachIdAndType(coach, "PRIVATE");
  if (!existPrivateTime) {
    console.log("No Open Slot Found for Coach: ", coach);
    return await TimeTableModel.create({ ...time });
  } else {
    // console.log(existPrivateTime);
    let id = existPrivateTime.id;
    // console.log("private slot id: ", id);
    return await TimeTableModel.update(time, { where: { id } });
  }
};

exports.getPublicSlots = async (coach) => {
  console.log("coach id: ", coach);
  return await getTimeTableByCoachIdAndType(coach, "PUBLIC");
};

exports.getCoachBookingsByDate = async (coach, date) => {
  console.log("coach id: ", coach);
  return await getBookingByCoachIdAndDate(coach, date);
};
