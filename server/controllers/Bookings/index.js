const { sequelize } = require("../../config");
const { BookingsModel } = require("../../models");
const {
  getBookingById,
  deleteBookingById,
  createBooking,
  getAllBookingsByUserId,
  getBookingByCoachId,
  updateBookingStatus,
  getBookingByChildrenIds,
  getBookings,
} = require("../../services/booking.service");
const { notifyUser } = require("../Notification");
const { getCoachById } = require("../../services/coach.service");
const {
  getGymnastById,
  updateGymnastStripeId,
} = require("../../services/gymnast.service");
const {
  createCustomer,
  createPaymentMethod,
  createEphemralKey,
  createPaymentIntent,
  getPaymentMethodsByCustomerId,
  getPaymentMethodsByCustomerIdAndPaymentMethodId,
  attachCustomerWithPaymentMethod,
} = require("../../services/stripe");
const {
  getChildrenByIdAndParent,
  getChildren,
} = require("../../services/gymnast.service");
const {
  getTimeTableByCoachId,
  getTimeTableByCoachIdAndTypeAndDate,
} = require("../../services/time_table.service");
const { getOffset } = require("../../utils/helpers/helper");
const { isRequestedTimeInRange } = require("../../utils/validators/validators");
const { NOTIFICATION_TYPE } = require("../../utils/helpers/helper");

const getAllBookings = async (req, res, next) => {
  try {
    const { currentUser } = req;
    let { page = 1, limit = 10 } = req.query;
    limit = +limit;
    page = +page;
    const offset = getOffset({ limit, page });
    if (currentUser.roles.some((role) => role.name === "admin")) {
      console.log("admin");
      const { gymnast, coach } = req.query;
      if ((!gymnast || gymnast === 0) && (!coach || coach === 0)) {
        return res.status(400).json({ message: "Coach or Gymnast Required" });
      }
      if (gymnast) {
        console.log("gymnast");
        let childrens = await getChildren(gymnast);
        const childrenIds = childrens.map((item) => item.id);
        console.log(childrenIds);
        let bookings = await getBookingByChildrenIds({
          childrenId: childrenIds,
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
      } else {
        console.log("coach");
        let bookings = await getBookings({
          id: coach,
          limit,
          offset,
        });
        console.log(bookings);
        if (!bookings || bookings.length === 0) {
          return res.status(200).json({ message: "No Data Found" });
        }
        return res.status(200).json({
          total: bookings.count,
          limit,
          currentPage: page,
          data: bookings.rows,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const myBookings = async (req, res, next) => {
  try {
    const { currentUser } = req;
    let { page = 1, limit = 10 } = req.query;
    limit = +limit;
    page = +page;
    const offset = getOffset({ limit, page });
    if (
      !currentUser.roles.some(
        (role) =>
          role.name === "coach" ||
          role.name === "admin" ||
          role.name === "gymnast"
      )
    ) {
      return res
        .status(400)
        .json({ message: "user is not a coach user or gymnast or admin" });
    }
    let id;
    if (
      !currentUser.roles.some(
        (role) => role.name === "coach" || role.name === "gymnast"
      )
    ) {
      const { coach, gymnast } = req.query;
      if (gymnast === 0 && coach === 0) {
        return res.status(400).json({ message: "Coach or Gymnast Required" });
      }
      if (gymnast != 0) {
        id = gymnast;
      } else {
        id = coach;
      }
    } else {
      if (currentUser.roles.some((role) => role.name === "gymnast")) {
        console.log("gymnast");
        let childrens = await getChildren(currentUser.id);
        const childrenIds = childrens.map((item) => item.id);
        console.log(childrenIds);
        let bookings = await getBookingByChildrenIds({
          childrenId: childrenIds,
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
      } else {
        id = currentUser.dataValues.id;
      }
    }

    const bookings = await getAllBookingsByUserId({
      id: id,
      limit,
      offset,
    });
    if (!bookings || bookings.length === 0) {
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
    const { currentUser } = req;
    if (status != "ACCEPT" && status != "REJECT" && status != "CANCEL") {
      return res.status(400).json({ message: "Invalid Status" });
    }
    console.log(status + "ING Booking");
    const booking = await getBookingById(id);
    if (!booking) {
      console.log("booking not found");
      return res.status(400).json({ message: `booking not found` });
    }
    console.log("booking found");
    if (!currentUser.roles.some((role) => role.name === "admin")) {
      console.log("not admin");
      if (booking.coachId != currentUser.id) {
        return res
          .status(400)
          .json({ message: "Cannot update booking that is not yours" });
      }
    } else {
      console.log("admin");
    }
    const update = await updateBookingStatus(id, status);
    console.log(update);
    if (update[0] === 1) {
      // const notify = await notifyUser(
      //   booking.gymnastId,
      //   currentUser,
      //   `Your private booking from ${currentUser.userName} has been ${status}ED`,
      //   NOTIFICATION_TYPE.MY_CALENDER
      // );
      // console.log(notify);
      return res.status(200).json({ message: `Booking ${status}ED` });
    } else {
      return res.status(400).json({ message: `error updating booking` });
    }
  } catch (error) {
    next(error);
  }
};

const createNewBooking = async (req, res, next) => {
  try {
    console.log("New Booking", req.currentUser.userName);
    const { currentUser } = req;
    const { to, from, coachId, childrenId } = req.body;
    if (
      coachId === currentUser.id ||
      req.currentUser.roles[0].name === "coach"
    ) {
      return res
        .status(400)
        .json({ message: "Can't Create Booking with self" });
    }
    if (!(coachId || to || from || childrenId)) {
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

    if (coach.gymId != currentUser.dataValues.gymId) {
      return res
        .status(400)
        .json({ message: "Selected Coach is not in your gym" });
    }

    const fromDateOnly = new Date(from).toISOString().split("T")[0];

    let coachTimeTable = await getTimeTableByCoachIdAndTypeAndDate(
      coach.id,
      "PRIVATE",
      fromDateOnly
    );
    if (coachTimeTable.length === 0) {
      return res
        .status(400)
        .json({ message: "Coach Private Schedule Not Found" });
    }
    console.log("Coach private schedule found");
    console.log(coachTimeTable);

    const child = await getChildrenByIdAndParent(
      childrenId,
      currentUser.dataValues.id
    );
    if (!child || child === null) {
      return res.status(400).json({ message: "Child Not Found" });
    }
    console.log(child);

    // let privateTimeTable = coachTimeTable.find(
    //   (coachTimeTable) => coachTimeTable.type === "PRIVATE"
    // );
    // let publicTimeTable = coachTimeTable.find(
    //   (coachTimeTable) => coachTimeTable.type === "PUBLIC"
    // );

    // if (
    //   !isRequestedTimeInRange(
    //     from.split(" ")[1],
    //     to.split(" ")[1],
    //     privateTimeTable.from,
    //     privateTimeTable.to
    //   )
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "Requested time not in Coach Private Slots" });
    // }

    let temp;
    if (coachTimeTable.length > 0) {
      console.log("TimeTablePrivate: ");
      for (const privateTimeSlot of coachTimeTable) {
        if (
          isRequestedTimeInRange(
            from,
            to,
            privateTimeSlot.from,
            privateTimeSlot.to
          )
        ) {
          console.log("privateTimePass: ");
          temp = privateTimeSlot;
          break;
        }
      }
    }
    // return;
    let bookings = await getBookingByCoachId(coach.id);

    if (bookings.length > 0) {
      const requestToUTC = new Date(new Date(to));
      const requestFromUTC = new Date(new Date(from));

      const hasOverlap = await bookings.some((booking) => {
        const bookingFrom = booking.from;
        const bookingTo = booking.to;

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
      console.log("Creating New Booking");
      const newBooking = await createBooking({
        childrenId: childrenId,
        coachId,
        to,
        from,
        status: "PENDING",
      });
      let message = `${currentUser.userName} has requested you for the private booking on `;
      const notify = await notifyUser(
        coach.id,
        currentUser,
        message,
        NOTIFICATION_TYPE.MY_PRIVATES
      );
      return {
        id: newBooking.dataValues.id,
        to: newBooking.to.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        }),
        from: newBooking.from.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          hour12: false,
        }),
        status: newBooking.status,
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

const confirmCheckout = async (req, res, next) => {
  console.log("confirm checkout");
  const { currentUser } = req;
  console.log(currentUser);
  let customer = await getGymnastById(currentUser.dataValues.id);
  if (!customer) {
    res
      .status(400)
      .json({ message: "user donot have stripe ID and payment methods" });
  }
  const { paymentMethod, paymentMethodId } = req.body;
  if (paymentMethodId) {
    let result = await getPaymentMethodsByCustomerIdAndPaymentMethodId(
      customer.stripeId,
      paymentMethodId
    );
    console.log(result);
  } else if (paymentMethod) {
    console.log(
      "creating new paymentMethod for stripe customer: ",
      customer.stripeId
    );
    let paymentIntent = await createPaymentIntent({
      customerStripeID: stripeCustomerId,
      price: 200 * 100,
    });
    if (!paymentIntent) {
      res
        .status(400)
        .json({ message: "Error while creating Payment Intent on stripe" });
    }
    console.log(
      "paymentIntent created successfully for customer: " +
        stripeCustomerId +
        " with id: " +
        paymentIntent.id
    );
    // let newPaymentMethod = await createPaymentMethod(paymentMethod);
    // console.log(newPaymentMethod);
    // let result = await attachCustomerWithPaymentMethod(
    //   newPaymentMethod.id,
    //   customer.stripeId
    // );
    // console.log(result);
  }
};

const checkout = async (req, res, next) => {
  console.log("checkout");
  const { currentUser } = req;
  if (!req.query.id) {
    return res.status(400).json({ message: "Invalid Booking ID" });
  }
  let booking = await getBookingById(req.query.id);
  if (!booking) {
    return res.status(400).json({ message: "Booking Not Found" });
  }
  // console.log("booking: ", booking);
  let customer = await getGymnastById(booking.gymnastId);
  let stripeCustomerId;
  if (!customer || customer.id != currentUser.id) {
    return res.status(400).json({ message: "Invalid User" });
  }
  // console.log(customer);
  if (!customer.stripeId) {
    console.log(
      "customer stripe id not exist, creating new customer on Stripe"
    );
    let stripeCustomer = await createCustomer();
    if (!stripeCustomer) {
      return res
        .status(400)
        .json({ message: "Error while creating customer on stripe" });
    }
    console.log(
      "stripeCustomer created successfully with id: ",
      stripeCustomer.id
    );
    stripeCustomerId = stripeCustomer.id;
    await updateGymnastStripeId(customer.id, stripeCustomerId);
    // return res.sendStatus(200);
  } else {
    console.log("stripe Id exist for customer");
    stripeCustomerId = customer.stripeId;
    let paymentMethod = await getPaymentMethodsByCustomerId(stripeCustomerId);
    console.log(paymentMethod.data);
    if (paymentMethod.data.length == 0) {
      console.log("no payment method found");
    }
    let obj = {
      customerKey: stripeCustomerId,
      paymentMethods: paymentMethod.data,
    };
    return res.status(200).json(obj);
  }
  console.log("here");
  const ephemeralKey = await createEphemralKey(stripeCustomerId);

  console.log("CustomerID: ", stripeCustomerId);
  console.log("Ephemeral Key: ", ephemeralKey);
  // let paymentIntent = await createPaymentIntent({
  //   customerStripeID: stripeCustomerId,
  //   price: 200 * 10,
  // });
  // if (!paymentIntent) {
  //   res
  //     .status(400)
  //     .json({ message: "Error while creating Payment Intent on stripe" });
  // }
  // console.log(
  //   "paymentIntent created successfully for customer: " +
  //     stripeCustomerId +
  //     " with id: " +
  //     paymentIntent.id
  // );
  // console.log("PaymentIntenet: ", paymentIntent);
  // return res.status(200).json(paymentIntent);
};

module.exports = {
  myBookings,
  createNewBooking,
  deleteBooking,
  updateBookings,
  getAllBookings,
  checkout,
  confirmCheckout,
};
