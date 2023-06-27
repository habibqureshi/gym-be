const {
  getAvailableCoach,
  getCoachById,
  saveSchedule,
  getMySchedules,
  updateCoachPrivateSlots,
  getPublicSlots,
  getPrivateCoach,
} = require("../../services/coach.service");
const { getOffset } = require("../../utils/helpers/helper");
const { isRequestedTimeInRange } = require("../../utils/validators/validators");
const {
  getTimeTableByCoachIdAndType,
} = require("../../services/time_table.service");
const moment = require("moment");

exports.getAllCoach = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const coach = await getCoachById(id);
      if (!coach) {
        return res.sendStatus(204); //.json({ message: "No Record Found", data: {} })
      }
      return res.status(200).json(coach);
    }
    let { page = 1, limit = 10 } = req.query;
    limit = +limit;
    page = +page;
    const offset = getOffset({ limit, page });
    const coaches = await getAvailableCoach({ limit, offset });
    if (coaches.count === 0) {
      return res.statusCode(204); //.json({ total: coaches.count, limit, currentPage: page, message: "No Data Found" })
    }
    return res.status(200).json({
      total: coaches.count,
      limit,
      currentPage: page,
      data: coaches.rows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrivateCoach = async (req, res, next) => {
  try {
    const coaches = await getPrivateCoach();
    if (!coaches) {
      return res.statusCode(204); //.json({ total: coaches.count, limit, currentPage: page, message: "No Data Found" })
    }
    return res.status(200).json({
      coaches,
    });
  } catch (error) {
    next(error);
  }
};

const isTimeBetween = (currentTime, startTime, endTime) => {
  const currentStart = moment(currentTime.split("-")[0], "HH:mm:ss");
  const currentEnd = moment(currentTime.split("-")[1], "HH:mm:ss");
  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");
  console.log("currentTime: ", start, end);
  console.log("publicTime: ", startTime, endTime);

  return (
    currentStart.isBetween(start, end, null, "[]") ||
    currentEnd.isBetween(start, end, null, "[]")
  );
};

exports.updatePrivateTime = async (req, res, next) => {
  const id = req.currentUser.dataValues.id;
  const coach = await getCoachById(id);
  const { privateFromTime, privateToTime } = req.body;
  if (!coach) {
    return res.sendStatus(204); //.json({ message: "No Record Found", data: {} })
  }
  if (!coach.private) {
    return res.status(400).json({ message: "Private Slots not Allowed" });
  }
  let currentTime = privateFromTime + "-" + privateToTime;
  let existPublicTime = await getTimeTableByCoachIdAndType(id, "PUBLIC");
  if (existPublicTime) {
    // console.log(
    //   isRequestedTimeInRange(
    //     privateFromTime,
    //     privateToTime,
    //     existPublicTime.from,
    //     existPublicTime.to
    //   )
    // );
    // return;
    if (
      isRequestedTimeInRange(
        privateFromTime,
        privateToTime,
        existPublicTime.from,
        existPublicTime.to
      )
    ) {
      return res.status(400).json({
        message: "Private Slot Cannot be in time frame of Public Slot",
      });
    }
  }

  let result = await updateCoachPrivateSlots(id, {
    privateFromTime,
    privateToTime,
  });
  if (result == 1) {
    res.status(200).json({ message: "Private Slots Updated" });
  } else {
    res.status(400).json({ message: "Private Slots not updated" });
  }
};

exports.getCoachPublicSlots = async (req, res, next) => {
  const id = req.currentUser.dataValues.id;
  const coach = await getCoachById(id);
  if (!coach) {
    return res.sendStatus(204); //.json({ message: "No Record Found", data: {} })
  }
  let publicSlots = await getPublicSlots(id);
  if (publicSlots) {
    res.status(200).json({
      type: publicSlots.type,
      from: publicSlots.from,
      to: publicSlots.to,
    });
  } else {
    res.status(400).json({ message: "No Scheduled Slot Available" });
  }
};

exports.saveSchedule = async (req, res, next) => {
  try {
    const { startTime, endTime, type } = req.body;
    const { currentUser } = req;
    const { id: coachId } = currentUser;
    const newSchedule = await saveSchedule({
      coachId,
      startTime,
      endTime,
      type,
    });
    return res.status(201).json({ newSchedule, message: "Schedule Created" });
  } catch (error) {
    next(error);
  }
};
exports.getMySchedule = async (req, res, next) => {
  try {
    const { currentUser } = req;
    let { page = 1, limit = 10 } = req.query;
    limit = +limit;
    page = +page;
    const offset = getOffset({ limit, page });
    const mySchedules = await getMySchedules({
      limit,
      offset,
      id: currentUser.id,
    });
    if (mySchedules.count === 0) {
      return res.statusCode(204); //.json({ total: mySchedules.count, limit, currentPage: page, message: "No Saved Schedules Found" })
    }
    return res.status(200).json({
      total: mySchedules.count,
      limit,
      currentPage: page,
      data: mySchedules.rows,
    });
  } catch (error) {
    next(error);
  }
};
