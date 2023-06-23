const { TimeTableModel } = require("../models");

exports.getTimeTableByCoachIdAndType = async (id, timeType) => {
  return TimeTableModel.findOne({
    where: {
      coach_id: id,
      type: timeType,
      deleted: false,
    },
    order: ["id"],
    raw: true,
  });
};

exports.getTimeTableByCoachId = async (id) => {
  return TimeTableModel.findAll({
    where: {
      coach_id: id,
      deleted: false,
    },
    order: ["id"],
    raw: true,
  });
};
