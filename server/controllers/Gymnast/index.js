const {
  getBookingByCoachIdAndDate,
} = require("../../services/booking.service");

const { getCoachById } = require("../../services/coach.service");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("../../services/time_table.service");

const { saveChildren, getChildren } = require("../../services/gymnast.service");

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
    if (!timeTable) {
      res.status(400).json({ message: "Coach Private Slot Not Found" });
    }
    console.log(timeTable);
    let result = await getBookingByCoachIdAndDate(coachId, date);
    if (result.length > 0) {
      const bookingList = result.map((obj) => {
        const { from, to } = obj;
        let currentFrom = from.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        });
        let currentTo = to.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        });
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
    if (!currentUser.roles.some((role) => role.name === "gymnast")) {
      return res.status(400).json({ message: "user is not a gymnast" });
    }
    const userId = currentUser.dataValues.id;
    const result = await getChildren(userId);
    if (result) {
      return res.status(200).json({ result });
    }
    return res.status(400).json({ message: "No Child Found" });
  } catch (error) {
    next(error);
  }
};
