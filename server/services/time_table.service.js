const { TimeTableModel } = require("../models");
const { Sequelize } = require("../config/index");
const { Op } = require("../config").Sequelize;

exports.getTimeTableByCoachIdAndType = async (id, timeType) => {
  return TimeTableModel.findAll({
    where: {
      coach_id: id,
      type: timeType,
      deleted: false,
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableByCoachIdAndTypeAndDate = async (id, timeType, from) => {
  return TimeTableModel.findAll({
    where: {
      coach_id: id,
      type: timeType,
      deleted: false,
      from: {
        [Sequelize.Op.gte]: from + " 00:00:00", // Start of the fromDate (00:00:00 time)
        [Sequelize.Op.lt]: from + " 23:59:59", // End of the fromDate (23:59:59 time)
      },
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableByCoachIdAndTypeAndDateRange = async (
  id,
  timeType,
  fromDate,
  toDate
) => {
  return TimeTableModel.findAll({
    where: {
      coach_id: id,
      type: timeType,
      deleted: false,
      from: {
        [Sequelize.Op.between]: [fromDate + " 00:00:00", toDate + " 23:59:59"],
      },
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableByCoachIdAndTypeAndDateExceptOne = async (
  id,
  timeType,
  from,
  scheduleId
) => {
  return TimeTableModel.findAll({
    where: {
      id: {
        [Op.ne]: scheduleId,
      },
      coach_id: id,
      type: timeType,
      deleted: false,
      from: {
        [Sequelize.Op.gte]: from + " 00:00:00", // Start of the fromDate (00:00:00 time)
        [Sequelize.Op.lt]: from + " 23:59:59", // End of the fromDate (23:59:59 time)
      },
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableByCoachId = async (id) => {
  console.log("getting timetable by coach ID: ", id);
  return TimeTableModel.findAll({
    where: {
      coach_id: id,
      deleted: false,
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableById = async (id) => {
  console.log("getting timetable by ID: ", id);
  return TimeTableModel.findOne({
    where: {
      id,
      deleted: false,
    },
    order: ["id"],
    raw: true,
  });
};
