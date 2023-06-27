const {
  getBookingByCoachIdAndDate,
} = require("../../services/booking.service");

const { getCoachById } = require("../../services/coach.service");
const {
  getTimeTableByCoachIdAndType,
} = require("../../services/time_table.service");

exports.coachBookingsByDate = async (req, res, next) => {
  try {
    const { coachId, date } = req.query;
    let coach = await getCoachById(coachId);
    if (!coach || !coach.private) {
      res.status(400).json({ message: "Coach Not Found" });
    }
    console.log("coachFound");

    let timeTable = await getTimeTableByCoachIdAndType(coachId, "PRIVATE");
    if (!timeTable) {
      res.status(400).json({ message: "Coach Private Slot Not Found" });
    }
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
