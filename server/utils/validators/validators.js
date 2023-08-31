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

const checkTimeOverlap = (dbFrom, dbTo, reqFrom, reqTo) => {
  const dbStartTime = new Date(`1970-01-01T${dbFrom}Z`).getTime();
  const dbEndTime = new Date(`1970-01-01T${dbTo}Z`).getTime();
  const reqStartTime = new Date(`1970-01-01T${reqFrom}Z`).getTime();
  const reqEndTime = new Date(`1970-01-01T${reqTo}Z`).getTime();

  return (
    (reqStartTime >= dbStartTime && reqStartTime < dbEndTime) ||
    (reqEndTime > dbStartTime && reqEndTime <= dbEndTime) ||
    (reqStartTime <= dbStartTime && reqEndTime >= dbEndTime)
  );
};

const isTimeInRange = (dbFrom, dbTo, reqFrom, reqTo) => {
  const dbStartTime = new Date(`1970-01-01T${dbFrom}Z`).getTime();
  const dbEndTime = new Date(`1970-01-01T${dbTo}Z`).getTime();
  const reqStartTime = new Date(`1970-01-01T${reqFrom}Z`).getTime();
  const reqEndTime = new Date(`1970-01-01T${reqTo}Z`).getTime();
  // console.log(dbStartTime, dbEndTime);
  // console.log(reqStartTime, reqEndTime);

  return reqStartTime >= dbStartTime && reqEndTime <= dbEndTime;
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

  console.log(
    "YO:",
    requestedStartTime,
    requestedEndTime,
    bookedStartTime,
    bookedEndTime,
    "end"
  );

  return (
    (requestedStartTime >= bookedStartTime &&
      requestedStartTime < bookedEndTime) ||
    (requestedEndTime > bookedStartTime && requestedEndTime <= bookedEndTime) ||
    (requestedStartTime <= bookedStartTime && requestedEndTime >= bookedEndTime)
  );
}

const isTimeRangeWithinRange = (start1, end1, start2, end2) => {
  const timeToMilliseconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  };

  const start1Millis = timeToMilliseconds(start1);
  const end1Millis = timeToMilliseconds(end1);
  const start2Millis = timeToMilliseconds(start2);
  const end2Millis = timeToMilliseconds(end2);

  return start1Millis >= start2Millis && end1Millis <= end2Millis;
};

function isTimeInGymRange(
  requestedFromTime,
  requestedToTime,
  fromTime,
  toTime
) {
  // const requestedFromDate = new Date(requestedFromTime).getTime();
  // const requestedToDate = new Date(requestedToTime).getTime();
  // const fromDate = new Date(fromTime).getTime();
  // const toDate = new Date(toTime).getTime();
  console.log(requestedFromTime);
  console.log(requestedToTime);
  console.log(fromTime);
  console.log(toTime);

  // Check if the requested "from" time is after or equal to the "from" time of the range,
  // and if the requested "to" time is before or equal to the "to" time of the range.
  return requestedFromTime >= fromTime && requestedToTime <= toTime;
}

module.exports = {
  signInValidator,
  signUpValidatorUser,
  signUpValidatorCoach,
  isTimeBetween,
  isRequestedDateTimeInRange,
  isRequestedTimeInRange,
  isTimeInGymRange,
  isTimeRangeWithinRange,
  checkTimeOverlap,
  isTimeInRange,
};
