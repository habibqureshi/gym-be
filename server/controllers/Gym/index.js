const {
  getAllGym,
  getGymByCityId,
  getGymBySize,
  getGymById,
  createGym,
  updateGym,
  saveSchedule,
  existsScheduleForGymAndDate,
  existsScheduleForGym,
  existsScheduleById,
  updateSchedule,
} = require("../../services/gym.service");
const { sequelize } = require("../../config/index");
const { getCityById } = require("../../services/city.service");
const { getOffset } = require("../../utils/helpers/helper");
const { createUser, getRoleByName } = require("../../services/auth.service");
const {
  getScheduleByDateRange,
  futureCoachSchedules,
} = require("../../services/coach.service");
const { getGymnastById } = require("../../services/gymnast.service");
const { getCoachById } = require("../../services/coach.service");
const { password } = require("../../config/config");
const {
  isRequestedTimeInRange,
  checkTimeOverlap,
} = require("../../utils/validators/validators");
const moment = require("moment");
const momentTimezone = require("moment-timezone");

exports.getGym = async (req, res, next) => {
  try {
    const { id } = req.query;
    if (id) {
      const gym = await getGymById(id);
      if (!gym) {
        return res.sendStatus(204);
      }
      return res.status(200).json(gym);
    }
    let gyms;
    const { city } = req.query;
    if (city) {
      console.log("finding gym by city: ", city);
      gyms = await getGymByCityId(city);
      console.log(gyms);
      if (gyms.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.length,
        data: gyms,
      });
    }
    const { size } = req.query;
    if (size) {
      let { page = 1, limit = 10 } = req.query;
      limit = +limit;
      page = +page;
      const offset = getOffset({ limit, page });
      gyms = await getGymBySize({ limit, offset });
      if (gyms.count === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.count,
        limit,
        currentPage: page,
        data: gyms.rows,
      });
    } else {
      gyms = await getAllGym();
      if (gyms.length === 0) {
        return res.sendStatus(204);
      }
      return res.status(200).json({
        total: gyms.length,
        data: gyms,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.createNewGym = async (req, res, next) => {
  try {
    const { name, cityId } = req.body;
    if (!name || cityId === 0) {
      console.log("Invalid Gym Name or City ");
      return res.status(400).json({ message: "Invalid Gym Name or City" });
    }
    const city = await getCityById(cityId);
    if (!city) {
      console.log("City Not Found");
      return res.status(400).json({ message: "City Not Found" });
    }
    console.log("City found");
    let newGym = null;
    const transaction = await sequelize.transaction(async (t) => {
      newGym = await createGym({ name, cityId });
    });
    if (newGym != null) {
      console.log("creating new user for the gym: " + newGym.dataValues.name);
      const userName = newGym.dataValues.name.replace(" ", "");
      const firstName = userName;
      const lastName = userName;
      let email = userName + "@abc.com";
      let password = "12345";
      let gymId = newGym.dataValues.id;
      //create new user for the gym
      const newUser = await createUser({
        userName,
        email,
        password,
        firstName,
        lastName,
        gymId,
      });
      const savedRole = await getRoleByName("gym");
      await newUser.setRoles([savedRole]);
    }
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGym = async (req, res, next) => {
  try {
    const { name, cityId } = req.body;
    const { id } = req.query;
    if (!name || name === "") {
      console.log("Invalid Gym Name");
      return res.status(400).json({ message: "Invalid Gym Name" });
    }
    const transaction = await sequelize.transaction(async (t) => {
      if (cityId && cityId != 0) {
        const city = await getCityById(stateId);
        if (!city) {
          console.log("City Not Found");
          return res.status(400).json({ message: "City Not Found" });
        }
        console.log("city found");
        const result = await updateGym(id, { name, cityId });
      } else {
        const result = await updateGym(id, { name });
      }
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteGym = async (req, res, next) => {
  try {
    const { id } = req.query;
    const transaction = await sequelize.transaction(async (t) => {
      let enable = false,
        deleted = false;
      const result = await updateGym(id, { enable, deleted });
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGymSchedule = async (req, res, next) => {
  try {
    const { currentUser } = req;
    if (
      !currentUser.roles.some(
        (role) => role.name === "gym" || role.name === "admin"
      )
    ) {
      return res
        .status(400)
        .json({ message: "user is not a gym user or admin" });
    }
    const { id } = req.query;
    if (!id || id === 0) {
      return res.status(200).json({ message: "Invalid Schedule ID" });
    }
    const gymSchedule = await existsScheduleById(id);
    if (!gymSchedule) {
      return res.status(400).json({ message: "Schedule not found" });
    }
    console.log(gymSchedule);

    const { from, to, day } = req.body;
    if (!from || !to) {
      return res.status(400).json({ message: "invalid date and time" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(today);

    const coachTimeTable = await futureCoachSchedules(
      id,
      today,
      gymSchedule.day
    );
    // console.log(coachTimeTable);
    if (coachTimeTable.length > 0) {
      return res.status(400).json({
        message: "Cannot update becuase Coach schedule exist on this day",
      });
    }
    let data = {
      from,
      to,
    };
    const result = await updateSchedule(gymSchedule.id, data);
    if (result[0] === 1) {
      return res.status(200).json({ message: "Gym Scheudle Updated" });
    }
  } catch (error) {
    next(error);
  }
};

exports.createGymSchedule = async (req, res, next) => {
  try {
    const { currentUser } = req;
    // console.log(currentUser.roles[0].dataValues);
    console.log(currentUser.roles.some((role) => role.name === "gym"));
    if (
      !currentUser.roles.some(
        (role) => role.name === "gym" || role.name === "admin"
      )
    ) {
      return res
        .status(400)
        .json({ message: "user is not a gym user or admin" });
    }
    let gymId;
    if (!currentUser.roles.some((role) => role.name === "gym")) {
      const { gym } = req.body;
      if (!gym || gym === 0) {
        return res.status(400).json({ message: "gym id is required" });
      }
      gymId = gym;
    } else {
      gymId = currentUser.dataValues.gymId;
      if (gymId === 0) {
        return res.status(400).json({ message: "gym id is required" });
      }
      console.log("gym user");
    }

    const { from, to, day, timeZone } = req.body;
    if (!from || !to || !day || !timeZone) {
      return res.status(400).json({ message: "invalid date and time" });
    }
    console.log(from);
    console.log(to);
    console.log(day);

    const exist = await existsScheduleForGymAndDate(gymId, day);

    // const timeZone = "Asia/Karachi";
    const fromUtc = moment
      .tz(from, "HH:mm:ss", timeZone)
      .utc()
      .format("HH:mm:ss");
    const toUtc = moment.tz(to, "HH:mm:ss", timeZone).utc().format("HH:mm:ss");

    if (exist && exist.length > 0) {
      for (data of exist) {
        // console.log(data);
        if (checkTimeOverlap(fromUtc, toUtc, data.from, data.to)) {
          console.log("overlap");
          return res.status(400).json({
            message:
              "Schedule for same day and time already exist for your gym",
          });
        } else {
          console.log("not overlap");
        }
      }
    }
    const status = "OPEN";
    const newSchedule = await saveSchedule({
      gymId,
      from: fromUtc,
      to: toUtc,
      status,
      day,
    });
    if (newSchedule) {
      return res
        .status(201)
        .json({ newSchedule, message: "GYM Schedule Created" });
    }
    return res.status(400).json({ message: "schedule not created" });
  } catch (error) {
    next(error);
  }
};

exports.getGymSchedule = async (req, res, next) => {
  try {
    const { currentUser } = req;
    // if (
    //   !currentUser.roles.some(
    //     (role) => role.name === "gym" || role.name === "admin"
    //   )
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "user is not a gym user or admin" });
    // }
    let gymId;
    if (
      !currentUser.roles.some(
        (role) =>
          role.name === "gym" ||
          role.name === "gymnast" ||
          role.name === "coach"
      )
    ) {
      const { gym, gymnastId, coachId } = req.query;
      if (gym && gym != 0) {
        gymId = gym;
      } else if (gymnastId && gymnastId != 0) {
        const gymnast = await getGymnastById(gymnastId);
        if (!gymnast || gymnast.gymId === 0) {
          return res.status(400).json({ message: "user gym is null" });
        }
        gymId = gymnast.gymId;
      } else if (coachId && coachId != 0) {
        const coach = await getCoachById(coachId);
        if (!coach || coach.gymId === 0) {
          return res.status(400).json({ message: "user gym is null" });
        }
        gymId = coach.gymId;
      }
    } else {
      if (currentUser.dataValues.gymId == 0) {
        return res.status(400).json({ message: "user gym is null" });
      }
      gymId = currentUser.dataValues.gymId;
      console.log("gym user");
    }

    const { from, to } = req.body;
    if (!from || !to) {
      let schedule = await existsScheduleForGym(gymId);
      // console.log(schedule);
      return res.status(200).json(schedule);
    }
    const date1 = from.split(" ")[0];
    const date2 = to.split(" ")[0];
    if (date1 != date2) {
      return res.status(400).json({
        message: "please select one date",
      });
    }

    const fromDateOnly = new Date(from).toISOString().split("T")[0];
    // console.log("from day: ", fromDateOnly);
    const exist = await existsScheduleForGymAndDate(gymId, fromDateOnly);
    // console.log("here", exist);
    return res.status(200).json(exist);
  } catch (error) {
    next(error);
  }
};
