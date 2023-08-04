const {
  getAvailableCoach,
  getCoachById,
  saveSchedule,
  getMySchedules,
  addCoachPrivateSlots,
  getPublicSlots,
  getPrivateCoach,
  getCoachSchedule,
  getCoachScheduleById,
  deleteCoachScheduleById,
} = require("../../services/coach.service");
const {
  getGymById,
  existsScheduleForGymAndDate,
} = require("../../services/gym.service");
const { getOffset } = require("../../utils/helpers/helper");
const {
  isRequestedTimeInRange,
  isTimeInGymRange,
} = require("../../utils/validators/validators");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("../../services/time_table.service");
const moment = require("moment");
const e = require("express");

exports.getAllCoach = async (req, res, next) => {
  console.log("fetching all coaches");
  try {
    const { id } = req.query;
    if (id) {
      console.log("coachID: " + id);
      const coach = await getCoachById(id);
      if (!coach) {
        console.log("Not Found");
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
    console.log("getting private coaches");
    const coaches = await getPrivateCoach();
    if (!coaches) {
      console.log("not found");
      return res.statusCode(204); //.json({ total: coaches.count, limit, currentPage: page, message: "No Data Found" })
    }
    return res.status(200).json({
      coaches,
    });
  } catch (error) {
    next(error);
  }
};

// const isTimeBetween = (currentTime, startTime, endTime) => {
//   const currentStart = moment(currentTime.split("-")[0], "HH:mm:ss");
//   const currentEnd = moment(currentTime.split("-")[1], "HH:mm:ss");
//   const start = moment(startTime, "HH:mm:ss");
//   const end = moment(endTime, "HH:mm:ss");
//   console.log("currentTime: ", start, end);
//   console.log("publicTime: ", startTime, endTime);

//   return (
//     currentStart.isBetween(start, end, null, "[]") ||
//     currentEnd.isBetween(start, end, null, "[]")
//   );
// };

exports.addCoachSlots = async (req, res, next) => {
  const { currentUser } = req;
  if (
    !currentUser.roles.some(
      (role) => role.name === "coach" || role.name === "admin"
    )
  ) {
    return res
      .status(400)
      .json({ message: "user is not a coach user or admin" });
  }
  let id;
  let createdBy;
  if (!currentUser.roles.some((role) => role.name === "coach")) {
    const { coach } = req.body;
    if (!coach || coach === 0) {
      return res.status(400).json({ message: "coach id is required" });
    }
    id = coach;
    createdBy = "ADMIN";
  } else {
    id = currentUser.dataValues.id;
    createdBy = "COACH";
    console.log("coach user");
  }
  const coach = await getCoachById(id);
  const { from, to, type } = req.body;
  if (!coach || !coach.gymId) {
    console.log("coach not found");
    return res.sendStatus(204);
  }
  if (!coach.private && type === "PRIVATE") {
    console.log("coach private bookings not allowed");
    return res.status(400).json({ message: "Private Slots not Allowed" });
  }

  let gym = await getGymById(coach.gymId);
  if (!gym) {
    return res.status(400).json({ message: "Coach Gym not found" });
  }
  // console.log(gym);

  const date1 = from.split(" ")[0];
  const date2 = to.split(" ")[0];
  if (date1 != date2) {
    return res.status(400).json({
      message: "please select one date",
    });
  }

  const fromDateOnly = new Date(from).toISOString().split("T")[0];

  console.log("fromDate", fromDateOnly);

  let gymSchedule = await existsScheduleForGymAndDate(gym.id, fromDateOnly);

  if (!gymSchedule) {
    return res
      .status(400)
      .json({ message: "Gym schedule not found for requested Date" });
  }
  console.log("schedule", gymSchedule.dataValues);

  const newFrom = new Date(from).toISOString();
  const newTo = new Date(to).toISOString();

  console.log(newFrom, newTo);

  // console.log(
  //   "gym overlap: ",
  //   isTimeInGymRange(newFrom, newTo, gymSchedule.from, gymSchedule.to)
  // );

  if (!isTimeInGymRange(newFrom, newTo, gymSchedule.from, gymSchedule.to)) {
    return res
      .status(400)
      .json({ message: "selected time not in gym schedule range" });
  }

  let existPublicTime = await getTimeTableByCoachIdAndTypeAndDate(
    id,
    "PUBLIC",
    fromDateOnly
  );
  let existPrivateTime = await getTimeTableByCoachIdAndTypeAndDate(
    id,
    "PRIVATE",
    fromDateOnly
  );
  if (existPublicTime.length > 0) {
    for (const publicTimeSlot of existPublicTime) {
      console.log(
        "public overlap: ",
        isRequestedTimeInRange(from, to, publicTimeSlot.from, publicTimeSlot.to)
      );

      if (
        isRequestedTimeInRange(from, to, publicTimeSlot.from, publicTimeSlot.to)
      ) {
        return res.status(400).json({
          message: "Private Slot Cannot be in time frame of Public Slot",
        });
      }
    }
  }
  if (existPrivateTime.length > 0) {
    for (const privateTimeSlot of existPrivateTime) {
      console.log(
        "private overlap: ",
        isRequestedTimeInRange(
          from,
          to,
          privateTimeSlot.from,
          privateTimeSlot.to
        )
      );

      if (
        isRequestedTimeInRange(
          from,
          to,
          privateTimeSlot.from,
          privateTimeSlot.to
        )
      ) {
        return res.status(400).json({
          message: "Private Slot Cannot be in time frame of Private Slot",
        });
      }
    }
  }
  let result = await addCoachPrivateSlots(id, from, to, type, createdBy);
  if (result) {
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

exports.getCoachSchedule = async (req, res, next) => {
  const { currentUser } = req;
  if (
    !currentUser.roles.some(
      (role) => role.name === "coach" || role.name === "admin"
    )
  ) {
    return res
      .status(400)
      .json({ message: "user is not a coach user or admin" });
  }
  let id;
  if (!currentUser.roles.some((role) => role.name === "coach")) {
    const { coach } = req.query;
    if (!coach || coach === 0) {
      return res.status(400).json({ message: "coach id is required" });
    }
    id = coach;
  } else {
    id = currentUser.dataValues.id;
    console.log("coach user");
  }
  const { from, to } = req.body;
  console.log(from, to);
  const coach = await getCoachById(id);
  if (!coach) {
    return res.sendStatus(204); //.json({ message: "No Record Found", data: {} })
  }
  const schedule = await getCoachSchedule(id, from, to);
  console.log("schedule", schedule);
  return res.status(200).json(schedule);
};

exports.deleteSchedule = async (req, res, next) => {
  const { currentUser } = req;
  if (
    !currentUser.roles.some(
      (role) => role.name === "coach" || role.name === "admin"
    )
  ) {
    return res
      .status(400)
      .json({ message: "user is not a coach user or admin" });
  }
  let id;
  if (!currentUser.roles.some((role) => role.name === "coach")) {
    const { coach } = req.query;
    if (!coach || coach === 0) {
      return res.status(400).json({ message: "coach id is required" });
    }
    id = coach;
  } else {
    id = currentUser.dataValues.id;
    console.log("coach user");
  }
  const { scheduleId } = req.body;
  const coach = await getCoachById(id);
  if (!coach) {
    return res.sendStatus(204); //.json({ message: "No Record Found", data: {} })
  }
  const schedule = await deleteCoachScheduleById(scheduleId, id);
  // if(schedule){
  //   await deleteCoachScheduleById(schedule.id,)
  // }
  return res.status(200).json(schedule);
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
