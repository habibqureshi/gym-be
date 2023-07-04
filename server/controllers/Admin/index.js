const { sequelize } = require("../../config");
const { getRoleByName, createUser } = require("../../services/auth.service");

const { getCoachById } = require("../../services/coach.service");
const { updateUser } = require("../../services/admin.service");
const { notifyUser } = require("../Notification");
const { NOTIFICATION_TYPE } = require("../../utils/helpers/helper");

const createCoach = async (req, res, next) => {
  try {
    let { email, firstName, lastName } = req.body;
    const transaction = await sequelize.transaction(async (t) => {
      const userName = email.split("@")[0];
      const password = Math.random().toString(36).slice(-10);
      const newUser = await createUser({
        userName,
        email,
        password,
        firstName,
        lastName,
      });
      const savedRole = await getRoleByName("coach");
      await newUser.setRoles([savedRole]);
      // send email on success signup here
      // { }
      return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userName: newUser.userName,
        password: newUser.password,
        role: { name: savedRole.name },
      };
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { currentUser } = req;
  const { id } = req.query;
  const {
    userName,
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    image,
    enable,
    deleted,
    phone,
    status,
    gymId,
    private,
    publicToTime,
    publicFromTime,
    privateFromTime,
    privateToTime,
  } = req.body;
  try {
    const user = await getCoachById(id);

    console.log("user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await updateUser(
      user.id,
      {
        userName,
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        image,
        enable,
        deleted,
        phone,
        status,
        gymId,
        private,
      },
      {
        publicToTime,
        publicFromTime,
        privateFromTime,
        privateToTime,
      }
    );
    if (updatedUser == 1) {
      if (private) {
        const notify = await notifyUser(
          user.id,
          currentUser,
          "You've been approved by the Admin",
          NOTIFICATION_TYPE.COACH
        );
      }
      res.status(200).json({ message: "User Updated" });
    } else {
      res.status(400).json({ message: updatedUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createCoach, update };
