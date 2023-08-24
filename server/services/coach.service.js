const {
  RoleModel,
  UserModel,
  ScheduleModel,
  TimeTableModel,
  GymModel,
} = require("../models");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("./time_table.service");
const { getBookingByCoachIdAndDate } = require("./booking.service");
const { Sequelize } = require("../config/index");
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
      "status",
    ],
    include: [
      {
        model: GymModel,
        attributes: ["id", "name"],
        required: true,
      },
    ],
    order: [["id", "DESC"]],
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
        model: GymModel,
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: {
          name: "COACH",
        },
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
    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: {
          name: "COACH",
        },
      },
    ],
    raw: true,
  });

exports.getPrivateCoachByGymId = async (gymId) =>
  await UserModel.findAll({
    where: {
      gymId,
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
    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: {
          name: "COACH",
        },
      },
    ],
    raw: true,
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

exports.updateCoachSlots = async (id, from, to) => {
  try {
    console.log("coach id: ", from, to);
    let time = {
      to,
      from,
    };

    return await TimeTableModel.update(time, { where: { id } });
  } catch (error) {
    console.log(error);
  }
};

// exports.getScheduleByDateRange = async (id, startDate, endDate) => {
//   const timeTable = await TimeTableModel.findAll({
//     where: {
//       deleted: false,
//       from: {
//         [Sequelize.Op.between]: [startDate, endDate],
//       },
//       include: [
//         {
//           model: UserModel,
//           attributes: ["id", "userName"],
//           // include: [
//           //   {
//           //     model: GymModel,
//           //     attributes: ["id", "name"],
//           //     where: {
//           //       id,
//           //     },
//           //   },
//           // ],
//         },
//       ],
//     },
//     raw: true,
//   });

exports.getScheduleByDateRange = async (gymId, startDate, endDate) => {
  console.log(gymId, startDate, endDate);
  const usersWithSchedules = await UserModel.findAll({
    where: {
      gymId, // Filter users based on the specified gym
    },
    include: [
      {
        model: TimeTableModel,
        where: {
          from: {
            [Sequelize.Op.between]: [startDate, endDate],
          },
        },
        // required: false, // Retrieve users even if they don't have a schedule in the given range
      },
    ],
    raw: true,
    nest: true, // Nest the schedules within the user object
  });

  return usersWithSchedules;
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
