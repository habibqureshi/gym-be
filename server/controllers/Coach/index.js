const {
  getAvailableCoach,
  getCoachById,
  saveSchedule,
  getMySchedules,
  addCoachPrivateSlots,
  updateCoachSlots,
  getPublicSlots,
  getPrivateCoach,
  getPrivateCoachByGymId,
  getCoachSchedule,
  getCoachScheduleById,
  deleteCoachScheduleById,
} = require("../../services/coach.service");
const { getGymnastById } = require("../../services/gymnast.service");
const {
  getGymById,
  existsScheduleForGymAndDate,
} = require("../../services/gym.service");
const { getOffset } = require("../../utils/helpers/helper");
const {
  isRequestedTimeInRange,
  isTimeInGymRange,
  isTimeRangeWithinRange,
  isTimeInRange,
} = require("../../utils/validators/validators");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
  getTimeTableByCoachIdAndTypeAndDateExceptOne,
  getTimeTableById,
} = require("../../services/time_table.service");
const { getBookingsByDateRange } = require("../../services/booking.service");
const moment = require("moment");
const e = require("express");
const { messaging } = require("firebase-admin");

exports.getAllCoach = async (req, res, next) => {
  console.log("fetching all coaches");
  try {
    const { id } = req.query;
    const { currentUser } = req;
    if (currentUser)
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
    const { currentUser } = req;
    // if (
    //   !currentUser.roles.some(
    //     (role) => role.name === "gymnast" || role.name === "admin"
    //   )
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "user is not a gymnast user or admin" });
    // }
    let coaches, gymId;
    if (currentUser.roles.some((role) => role.name === "gymnast")) {
      gymId = currentUser.dataValues.gymId;
      coaches = await getPrivateCoachByGymId(gymId);
    } else {
      const { gymnastId } = req.query;
      if (!gymnastId || gymnastId === 0) {
        return res.status(400).json({ message: "Invalid Gymnast Id" });
      }
      const gymnast = await getGymnastById(gymnastId);
      if (!gymnast) {
        return res.status(400).json({ message: "Gymnast Not Found" });
      }
      gymId = gymnast.gymId;
      coaches = await getPrivateCoachByGymId(gymId);
    }

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

exports.updateCoachSlots = async (req, res, next) => {
  try {
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
    const { scheduleId } = req.query;
    if (!scheduleId || scheduleId === 0) {
      return res.status(400).json({ message: "Invalid Schedule Id " });
    }
    const schedule = await getTimeTableById(scheduleId);
    if (!schedule) {
      return res.status(400).json({ message: "Schedule Not Found" });
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
    const { from, to } = req.body;
    let gym = await getGymById(coach.gymId);
    if (!gym) {
      return res.status(400).json({ message: "Coach Gym not found" });
    }

    const date1 = from.split(" ")[0];
    const date2 = to.split(" ")[0];
    if (date1 != date2) {
      return res.status(400).json({
        message: "please select one date",
      });
    }
    const fromDateOnly = new Date(from).toISOString().split("T")[0];
    let gymSchedule = await existsScheduleForGymAndDate(gym.id, fromDateOnly);
    if (!gymSchedule) {
      return res
        .status(400)
        .json({ message: "Gym schedule not found for requested Date" });
    }
    console.log("schedule", gymSchedule.length);
    const newFrom = new Date(from).toISOString();
    const newTo = new Date(to).toISOString();
    console.log(newFrom, newTo);
    if (gymSchedule.length > 0) {
      for (data of gymSchedule) {
        if (!isTimeInGymRange(newFrom, newTo, data.from, data.to)) {
          return res
            .status(400)
            .json({ message: "selected time not in gym schedule range" });
        }
      }
    }
    let existPublicTime = await getTimeTableByCoachIdAndTypeAndDateExceptOne(
      id,
      "PUBLIC",
      fromDateOnly,
      scheduleId
    );
    let existPrivateTime = await getTimeTableByCoachIdAndTypeAndDateExceptOne(
      id,
      "PRIVATE",
      fromDateOnly,
      scheduleId
    );
    // console.log(existPrivateTime);
    // console.log(existPublicTime);
    // return;
    if (existPublicTime.length > 0) {
      for (const publicTimeSlot of existPublicTime) {
        console.log(
          "public overlap: ",
          isRequestedTimeInRange(
            from,
            to,
            publicTimeSlot.from,
            publicTimeSlot.to
          )
        );

        if (
          isRequestedTimeInRange(
            from,
            to,
            publicTimeSlot.from,
            publicTimeSlot.to
          )
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
    const bookings = await getBookingsByDateRange(schedule.from, schedule.to);
    console.log(bookings);
    if (bookings && bookings.length > 0) {
      return res
        .status(400)
        .json({ message: "Slot Cannot Update because of existing Booking" });
    }
    const result = await updateCoachSlots(scheduleId, from, to);
    console.log(result);
    if (result[0] === 1) {
      return res.status(200).json({ message: "Coach Slot updated" });
    }
    return res.status(400).json({ message: "Error updating slots" });
  } catch (error) {
    next(error);
  }
};

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
  const { from, to, type, timeZone } = req.body;
  if (!from || !to || !timeZone || !type) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }
  const coach = await getCoachById(id);
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
  console.log("gym found here");

  const date1 = from.split(" ")[0];
  const date2 = to.split(" ")[0];
  if (date1 != date2) {
    return res.status(400).json({
      message: "please select one date",
    });
  }

  const fromNew = new Date(from);
  const fromDateOnly = new Date(from).toISOString().split("T")[0];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeekIndex = fromNew.getDay();

  const dayOfWeek = daysOfWeek[dayOfWeekIndex];

  console.log(dayOfWeek);

  let gymSchedule = await existsScheduleForGymAndDate(gym.id, dayOfWeek);

  // console.log(gymSchedule);

  if (!gymSchedule || !gymSchedule.length > 0) {
    return res
      .status(400)
      .json({ message: "Gym schedule not found for requested Date" });
  }

  const fromUtcTime = moment
    .tz(from, timeZone)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss")
    .split(" ")[1];
  const toUtcTime = moment
    .tz(to, timeZone)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss")
    .split(" ")[1];

  console.log(
    "timeZone time: ",
    moment.tz(from, timeZone).utc().format("YYYY-MM-DD HH:mm:ss"),
    moment.tz(to, timeZone).utc().format("YYYY-MM-DD HH:mm:ss")
  );

  // return;

  let inRange = false;

  console.log(gymSchedule);

  for (scheduleData of gymSchedule) {
    if (
      isTimeInRange(scheduleData.from, scheduleData.to, fromUtcTime, toUtcTime)
    ) {
      console.log("inRange");
      inRange = true;
      break;
    }
  }
  console.log(inRange);
  if (!inRange) {
    return res.status(400).json({ message: "Time not in Gym schedule range" });
  }
  // return;

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
  let result = await addCoachPrivateSlots(
    id,
    from,
    to,
    type,
    createdBy,
    dayOfWeek
  );
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
