const { getTimeTableByCoachIdAndType } = require("./time_table.service");
const { TimeTableModel, UserModel } = require("../models");
const { isRequestedTimeInRange } = require("../utils/validators/validators");

const updateUser = async (id, data, timeTable) => {
  try {
    let updateCoadId = id;
    const result = await UserModel.update(data, { where: { id } });
    console.log("result: ", result);
    let scheduleTime, privateTime;
    if (timeTable) {
      if (timeTable.publicToTime && timeTable.publicFromTime) {
        scheduleTime = {
          to: timeTable.publicToTime,
          from: timeTable.publicFromTime,
          type: "PUBLIC",
          enable: true,
          deleted: false,
          coachId: updateCoadId,
          createdBy: "ADMIN",
        };
        let existScheduleTime = await getTimeTableByCoachIdAndType(
          updateCoadId,
          "PUBLIC"
        );
        console.log("existSchedule: ", existScheduleTime);
        if (!existScheduleTime) {
          await TimeTableModel.create({ ...scheduleTime });
        } else {
          let id = existScheduleTime.id;
          await TimeTableModel.update(scheduleTime, { where: { id } });
        }
      }
      if (timeTable.privateToTime && timeTable.privateFromTime) {
        console.log(
          isRequestedTimeInRange(
            timeTable.privateFromTime,
            timeTable.privateToTime,
            timeTable.publicFromTime,
            timeTable.publicToTime
          )
        );
        // return;
        if (
          isRequestedTimeInRange(
            timeTable.privateFromTime,
            timeTable.privateToTime,
            timeTable.publicFromTime,
            timeTable.publicToTime
          )
        ) {
          return "Private Slots cannot be overlap by Public Slots";
        }
        privateTime = {
          to: timeTable.privateToTime,
          from: timeTable.privateFromTime,
          type: "PRIVATE",
          enable: true,
          deleted: false,
          coachId: updateCoadId,
          createdBy: "ADMIN",
        };
        let existScheduleTime = await getTimeTableByCoachIdAndType(
          updateCoadId,
          "PRIVATE"
        );
        console.log("existPrivate: ", existScheduleTime);
        if (!existScheduleTime) {
          await TimeTableModel.create({ ...privateTime });
        } else {
          let id = existScheduleTime.id;
          await TimeTableModel.update(privateTime, { where: { id } });
        }
      }
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { updateUser };
