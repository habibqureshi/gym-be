const { validateRoute } = require("express-ajv-middleware");
const { INTEGER } = require("sequelize");
const signInValidator = () => {
  return validateRoute({
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: {
          type: "string",
          nullable: false,
          minLength: 3,
          maxLength: 100,
          errorMessage: "User Name is not valid",
        },
        password: {
          type: "string",
          nullable: false,
          minLength: 5,
          maxLength: 100,
          errorMessage: "Password is not valid",
        },
        deviceToken: {
          type: "string",
          nullable: false,
          errorMessage: "Device Tokens is not valid",
        },
      },
      additionalProperties: false,
    },
  });
};

const signUpValidatorUser = () => {
  return validateRoute({
    body: {
      type: "object",
      required: [
        "firstName",
        "lastName",
        "password",
        "email",
        "phone",
        "userName",
        "userType",
        "gymId",
      ],
      additionalProperties: false,
      properties: {
        firstName: {
          type: "string",
          nullable: false,
          minLength: 2,
          maxLength: 100,
          errorMessage: "First Name is not valid",
        },
        lastName: {
          type: "string",
          nullable: false,
          minLength: 2,
          maxLength: 100,
          errorMessage: "Last Name is not valid",
        },
        userName: {
          type: "string",
          nullable: false,
          minLength: 2,
          maxLength: 100,
          errorMessage: { message: "userName is Not Valid" },
        },
        email: {
          type: "string",
          nullable: false,
        },
        password: {
          type: "string",
          nullable: false,
          minLength: 5,
          maxLength: 100,
          errorMessage: "Password is not valid",
        },
        userType: {
          type: "string",
          nullable: false,
          errorMessage: "userType is not valid",
        },
        phone: {
          type: "string",
          nullable: true,
          errorMessage: "userType is not valid",
        },
        gymId: {
          nullable: false,
          errorMessage: "gym id is not valid",
        },
      },
    },
  });
};
const signUpValidatorCoach = () => {
  return validateRoute({
    body: {
      type: "object",
      required: ["firstName", "lastName", "email"],
      additionalProperties: false,
      properties: {
        firstName: {
          type: "string",
          nullable: false,
          minLength: 2,
          maxLength: 100,
          errorMessage: "First Name is not valid",
        },
        lastName: {
          type: "string",
          nullable: false,
          minLength: 2,
          maxLength: 100,
          errorMessage: "Last Name is not valid",
        },
        email: {
          type: "string",
          nullable: false,
        },
      },
    },
  });
};

const isTimeBetween = (currentTime, startTime, endTime) => {
  const currentStart = moment(currentTime.split("-")[0], "HH:mm:ss");
  const currentEnd = moment(currentTime.split("-")[1], "HH:mm:ss");
  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");

  return (
    currentStart.isBetween(start, end, null, "[]") ||
    currentEnd.isBetween(start, end, null, "[]")
  );
};

function isRequestedDateTimeInRange(
  requestedFrom,
  requestedTo,
  bookedFrom,
  bookedTo
) {
  const requestedStart = new Date(requestedFrom);
  const requestedEnd = new Date(requestedTo);
  const bookedStart = new Date(bookedFrom);
  const bookedEnd = new Date(bookedTo);

  return (
    (requestedStart >= bookedStart && requestedStart <= bookedEnd) ||
    (requestedEnd >= bookedStart && requestedEnd <= bookedEnd)
  );
}

function isRequestedTimeInRange(
  requestedFrom,
  requestedTo,
  bookedFrom,
  bookedTo
) {
  const requestedStartTime = new Date(requestedFrom).getTime();
  const requestedEndTime = new Date(requestedTo).getTime();
  const bookedStartTime = new Date(bookedFrom).getTime();
  const bookedEndTime = new Date(bookedTo).getTime();

  // console.log(
  //   "YO:",
  //   requestedStartTime,
  //   requestedEndTime,
  //   bookedStartTime,
  //   bookedEndTime,
  //   "end"
  // );

  return (
    (requestedStartTime >= bookedStartTime &&
      requestedStartTime < bookedEndTime) ||
    (requestedEndTime > bookedStartTime && requestedEndTime <= bookedEndTime) ||
    (requestedStartTime <= bookedStartTime && requestedEndTime >= bookedEndTime)
  );
}

function isTimeInGymRange(
  requestedFromTime,
  requestedToTime,
  fromTime,
  toTime
) {
  const requestedFromDate = new Date(requestedFromTime).getTime();
  const requestedToDate = new Date(requestedToTime).getTime();
  const fromDate = new Date(fromTime).getTime();
  const toDate = new Date(toTime).getTime();

  // Check if the requested "from" time is after or equal to the "from" time of the range,
  // and if the requested "to" time is before or equal to the "to" time of the range.
  return requestedFromDate >= fromDate && requestedToDate <= toDate;
}

module.exports = {
  signInValidator,
  signUpValidatorUser,
  signUpValidatorCoach,
  isTimeBetween,
  isRequestedDateTimeInRange,
  isRequestedTimeInRange,
  isTimeInGymRange,
};
