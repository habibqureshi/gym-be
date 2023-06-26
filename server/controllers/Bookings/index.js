const { sequelize } = require("../../config");
const { BookingsModel } = require("../../models");
const {
  getBookingById,
  deleteBookingById,
  createBooking,
  getAllBookingsByUserId,
  getBookingByCoachId,
  updateBookingStatus,
} = require("../../services/booking.service");
const { notifyUser } = require("../Notification");
const { getCoachById } = require("../../services/coach.service");
const { getTimeTableByCoachId } = require("../../services/time_table.service");
const { getOffset } = require("../../utils/helpers/helper");
const { isRequestedTimeInRange } = require("../../utils/validators/validators");
const myBookings = async (req, res, next) => {
  try {
    const { currentUser } = req;
    let { page = 1, limit = 10 } = req.query;
    limit = +limit;
    page = +page;
    const offset = getOffset({ limit, page });
    const bookings = await getAllBookingsByUserId({
      id: currentUser.id,
      limit,
      offset,
    });
    if (bookings.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }
    return res.status(200).json({
      total: bookings.count,
      limit,
      currentPage: page,
      data: bookings.rows,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookings = async (req, res, next) => {
  try {
    const { id, status } = req.query;
    console.log(id, status);
    const update = await updateBookingStatus(id, status);
    console.log(update);
    if (update[0] === 1) {
      return res.status(200).json({ message: `Booking ${status}` });
    } else {
      return res.status(400).json({ message: `error updating booking` });
    }
  } catch (error) {
    next(error);
  }
};

const createNewBooking = async (req, res, next) => {
  try {
    console.log("booking user", req.currentUser.roles[0].name);
    const { currentUser } = req;
    const { to, from, coachId } = req.body;
    if (
      coachId === currentUser.id ||
      req.currentUser.roles[0].name === "coach"
    ) {
      return res
        .status(400)
        .json({ message: "Can't Create Booking with self" });
    }
    if (!(coachId && to && from)) {
      return res.status(400).json({ message: "Invalid Request Parameters" });
    }
    const coach = await getCoachById(coachId);

    if (coach === null || coach["roles.name"] != "coach") {
      return res.status(400).json({ message: "Coach Not Found" });
    }
    if (!coach.private) {
      return res
        .status(400)
        .json({ message: "Coach Not Allowed for Private Bookings" });
    }
    let coachTimeTable = await getTimeTableByCoachId(coach.id);
    if (!coachTimeTable) {
      return res
        .status(400)
        .json({ message: "Coach Private Schedule Not Found" });
    }

    let privateTimeTable = coachTimeTable.find(
      (coachTimeTable) => coachTimeTable.type === "PRIVATE"
    );
    let publicTimeTable = coachTimeTable.find(
      (coachTimeTable) => coachTimeTable.type === "PUBLIC"
    );

    console.log(from.split(" ")[1]);
    console.log(to.split(" ")[1]);
    console.log(privateTimeTable.from);
    console.log(privateTimeTable.to);
    if (
      !isRequestedTimeInRange(
        from.split(" ")[1],
        to.split(" ")[1],
        privateTimeTable.from,
        privateTimeTable.to
      )
    ) {
      return res
        .status(400)
        .json({ message: "Requested time not in Coach Private Slots" });
    }
    console.log("privateTimePass");
    let bookings = await getBookingByCoachId(coach.id);

    if (bookings.length > 0) {
      const requestToUTC = new Date(new Date(to));
      const requestFromUTC = new Date(new Date(from));

      // console.log("new", requestToUTC);
      // console.log("new", requestFromUTC);

      const hasOverlap = await bookings.some((booking) => {
        const bookingFrom = booking.from;
        const bookingTo = booking.to;

        // console.log("booked", bookingTo);
        // console.log("booked", bookingFrom);

        // Check for overlap
        return (
          (requestFromUTC >= bookingFrom && requestFromUTC < bookingTo) ||
          (requestToUTC > bookingFrom && requestToUTC <= bookingTo) ||
          (requestFromUTC <= bookingFrom && requestToUTC >= bookingTo)
        );
      });

      if (!hasOverlap) {
        console.log("Booking is available.");
      } else {
        console.log(
          "Booking is not available due to clash with existing bookings."
        );
        return res.status(400).json({
          message:
            "Booking is not available due to clash with existing bookings.",
        });
      }
    }

    const transaction = await sequelize.transaction(async (t) => {
      const newBooking = await createBooking({
        gymnastId: currentUser.id,
        coachId,
        to,
        from,
        status: "PENDING",
      });
      console.log(newBooking.to);
      let message = `${currentUser.userName} has requested you for the private booking on `;
      const notify = await notifyUser(coach.id, currentUser, message);
      // console.log(notify);
      return {
        id: newBooking.dataValues.id,
        to: newBooking.to.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        }),
        //   .replaceAll("/", "-")
        //   .replace(",", "")
        from: newBooking.from.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        }),
        status: newBooking.status,

        //   .replaceAll("/", "-")
        //   .replace(",", "")
        coach: {
          id: coach.id,
          userName: coach.userName,
          firstName: coach.firstName,
          lastName: coach.lastName,
          // image: coach.image,
        },
      };
    });
    return res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { currentUser } = req;
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Invalid Record Id" });
    }
    const booking = await getBookingById(id);
    if (booking === null) {
      return res.status(400).json({ message: "Booking Not Found" });
    }
    if (booking.dataValues.gymnastId !== currentUser.id) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this booking" });
    }
    await sequelize.transaction(async (t) => {
      return await deleteBookingById(id);
    });
    return res
      .status(201)
      .json({ message: `booking deleted success with id : ${id}` });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  myBookings,
  createNewBooking,
  deleteBooking,
  updateBookings,
};
