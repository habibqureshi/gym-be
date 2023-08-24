const {
  getBookingByCoachIdAndDate,
} = require("../../services/booking.service");

const { getCoachById } = require("../../services/coach.service");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("../../services/time_table.service");

const {
  saveChildren,
  getChildren,
  getAllGymnast,
  updateChildren,
  updateChildrenByUserId,
} = require("../../services/gymnast.service");

exports.coachBookingsByDate = async (req, res, next) => {
  try {
    const { coachId, date } = req.query;
    let coach = await getCoachById(coachId);
    if (!coach || !coach.private) {
      res.status(400).json({ message: "Coach Not Found" });
    }
    console.log("coachFound", date);

    // const fromDateOnly = new Date(date).toISOString().split("T")[0];

    let timeTable = await getTimeTableByCoachIdAndTypeAndDate(
      coachId,
      "PRIVATE",
      date
    );
    console.log("Timetable: ", timeTable);
    if (timeTable.length === 0) {
      return res.status(400).json({ message: "Coach Private Slot Not Found" });
    }
    console.log(timeTable);
    let result = await getBookingByCoachIdAndDate(coachId, date);
    if (result.length > 0) {
      const bookingList = result.map((obj) => {
        const { from, to } = obj;
        let currentFrom = from;
        let currentTo = to;
        return { currentFrom, currentTo };
      });

      return res.status(200).json({
        privateAllowedSlots: timeTable,
        bookings: bookingList,
      });
    } else {
      return res.status(200).json({
        privateAllowedSlots: timeTable,
        bookings: [],
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllGymnast = async (req, res, next) => {
  try {
    const { currentUser } = req;
    if (!currentUser.roles.some((role) => role.name === "admin")) {
      return res.status(400).json({ message: "user is not a admin" });
    }
    const gymnast = await getAllGymnast();
    if (!gymnast) {
      return res.status(201).json({ message: "No Data Found" });
    }
    return res.status(200).json(gymnast);
  } catch (error) {
    next(error);
  }
};

exports.addNewChildren = async (req, res, next) => {
  try {
    console.log("adding new children");
    const { currentUser } = req;
    if (!currentUser.roles.some((role) => role.name === "gymnast")) {
      return res.status(400).json({ message: "user is not a gymnast" });
    }
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Invalid Name" });
    }
    const userId = currentUser.dataValues.id;
    const newChildren = await saveChildren({
      userId,
      name,
    });
    if (newChildren) {
      return res.status(201).json({ newChildren, message: "New Child Added" });
    }
    return res.status(400).json({ message: "Error while saving new child" });
  } catch (error) {
    next(error);
  }
};

exports.getChildrenByUserId = async (req, res, next) => {
  try {
    console.log("getting children");
    const { currentUser } = req;
    if (
      !currentUser.roles.some(
        (role) => role.name === "gymnast" || role.name === "admin"
      )
    ) {
      return res.status(400).json({ message: "user is not a gymnast" });
    }
    let userId;
    if (currentUser.roles.some((role) => role.name === "admin")) {
      const { gymnast } = req.query;
      if (gymnast != 0) {
        userId = gymnast;
      }
    } else {
      userId = currentUser.dataValues.id;
    }
    const result = await getChildren(userId);
    if (result) {
      return res.status(200).json({ result });
    }
    return res.status(400).json({ message: "No Child Found" });
  } catch (error) {
    next(error);
  }
};

exports.deleteChildren = async (req, res, next) => {
  try {
    console.log("deleting child");
    const { currentUser } = req;
    const { id } = req.query;
    if (
      !currentUser.roles.some(
        (role) => role.name === "gymnast" || role.name === "admin"
      )
    ) {
      console.log("not a gymnast");
      return res.status(400).json({ message: "User is not a Gymnast" });
    }
    if (!id || id === 0) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const data = {
      deleted: true,
      enable: false,
    };
    if (currentUser.roles.some((role) => role.name === "gymnast")) {
      const result = await updateChildrenByUserId(
        id,
        currentUser.dataValues.id,
        data
      );
      if (result[0] === 1) {
        return res.status(200).json({ message: "Child Deleted" });
      }
    } else {
      const result = await updateChildren(id, data);
      if (result[0] === 1) {
        return res.status(200).json({ message: "Child Deleted" });
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.updateChildren = async (req, res, next) => {
  try {
    console.log("updating child");
    const { currentUser } = req;
    const { id, name } = req.body;
    if (!currentUser.roles.some((role) => role.name === "gymnast")) {
      console.log("not a gymnast");
      return res.status(400).json({ message: "User is not a Gymnast" });
    }
    if (!id || id === 0) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const data = {
      name: name,
    };
    const result = await updateChildren(id, currentUser.dataValues.id, data);
    console.log(result);
    if (result[0] === 1) {
      return res.status(200).json({ message: "Child Updated" });
    }
  } catch (error) {
    next(error);
  }
};
