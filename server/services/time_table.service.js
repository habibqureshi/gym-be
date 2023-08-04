const { TimeTableModel } = require("../models");
const { Sequelize } = require("../config/index");

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
