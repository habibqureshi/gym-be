const {
  getBookingByCoachIdAndDate,
  getBookingByCoachIdAndDateRange,
} = require("../../services/booking.service");

const { getCoachById } = require("../../services/coach.service");
const {
  getTimeTableByCoachIdAndType,
  getTimeTableByCoachIdAndTypeAndDate,
  getTimeTableByCoachIdAndTypeAndDateRange,
} = require("../../services/time_table.service");

const { getGymnastById } = require("../../services/gymnast.service");

const {
  saveChildren,
  getChildren,
  getAllGymnast,
  updateChildren,
  updateChildrenByUserId,
} = require("../../services/gymnast.service");

exports.coachBookingsByDate = async (req, res, next) => {
  try {
    const { coachId, from, to } = req.query;
    let coach = await getCoachById(coachId);
    if (!coach || !coach.private) {
      res.status(400).json({ message: "Coach Not Found" });
    }
    console.log("coachFound");

    const fromDate = new Date(from).toISOString().split(" ")[0];
    const toDate = new Date(to).toISOString().split(" ")[0];

    let timeTable = await getTimeTableByCoachIdAndTypeAndDateRange(
      coachId,
      "PRIVATE",
      from,
      to
    );
    console.log("Timetable: ", timeTable);
    if (timeTable.length === 0) {
      return res.status(400).json({ message: "Coach Private Slot Not Found" });
    }
    console.log(timeTable);
    let result = await getBookingByCoachIdAndDateRange(coachId, from, to);
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
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Invalid Name" });
    }

    let userId;

    if (!currentUser.roles.some((role) => role.name === "gymnast")) {
      const { gymnastId } = req.query;
      if (!gymnastId || gymnastId === 0) {
        return res.status(400).json({ message: "Invalid Gymnast ID" });
      }
      const gymnast = await getGymnastById(gymnastId);
      if (!gymnast) {
        return res.status(400).json({ message: "Gymnast Not Found" });
      }
      userId = gymnast.id;
    } else {
      userId = currentUser.dataValues.id;
    }

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
    let userId;
    if (currentUser.roles.some((role) => role.name === "admin")) {
      const { gymnast } = req.query;
      if (!gymnast && gymnast === 0) {
        return res.status(400).json({ message: "No Child Found" });
      }
      userId = gymnast;
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
    // if (
    //   !currentUser.roles.some(
    //     (role) => role.name === "gymnast" || role.name === "admin"
    //   )
    // ) {
    //   console.log("not a gymnast");
    //   return res.status(400).json({ message: "User is not a Gymnast" });
    // }
    if (!id || id === 0) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const data = {
      deleted: true,
      enable: false,
    };
    if (currentUser.roles.some((role) => role.name === "gymnast")) {
      console.log("gymnast user");
      const result = await updateChildrenByUserId(
        id,
        currentUser.dataValues.id,
        data
      );
      if (result[0] === 1) {
        return res.status(200).json({ message: "Child Deleted" });
      }
    } else if (currentUser.roles.some((role) => role.name === "admin")) {
      console.log("admin user");
      const result = await updateChildren(id, data);
      console.log("result ", result);
      if (result[0] === 1) {
        return res.status(200).json({ message: "Child Deleted" });
      }
    }
    return res.status(400).json({ message: "Error while deleting" });
  } catch (error) {
    next(error);
  }
};

exports.updateChildren = async (req, res, next) => {
  try {
    console.log("updating child");
    const { currentUser } = req;
    const { id, name } = req.body;
    let userId;
    if (currentUser.roles.some((role) => role.name === "gymnast")) {
      userId = currentUser.dataValues.id;
    } else if (currentUser.roles.some((role) => role.name === "admin")) {
      const { gymnastId } = req.body;
      if (!gymnastId || gymnastId === 0) {
        return res.status(400).json({ message: "Gymnast ID required" });
      }
      userId = gymnastId;
    }
    if (!id || id === 0) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const data = {
      name: name,
    };
    // console.log(currentUser.dataValues.id, name);
    const result = await updateChildrenByUserId(id, userId, data);
    console.log(result);
    if (result[0] === 1) {
      return res.status(200).json({ message: "Child Updated" });
    }
    return res.status(400).json({ message: "Error while updating child" });
  } catch (error) {
    next(error);
  }
};
