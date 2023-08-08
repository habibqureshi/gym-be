const {
  RoleModel,
  UserModel,
  ScheduleModel,
  TimeTableModel,
  Children,
  GymModel,
} = require("../models");

exports.getGymnastById = async (id) =>
  await UserModel.findOne({
    where: {
      deleted: false,
      id,
    },
    attributes: [
      "id",
      "userName",
      "firstName",
      "lastName",
      "phoneNumber",
      "image",
      "stripeId",
    ],

    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: { name: "gymnast" },
      },
    ],
    raw: true,
  });

exports.updateGymnastStripeId = async (id, stripeId) => {
  try {
    console.log(id, stripeId);
    const user = await UserModel.findByPk(id); // Find the user by their ID

    if (!user) {
      throw new Error("User not found"); // Handle the case if user is not found
    }

    user.stripeId = stripeId; // Update the stripeId field
    await user.save(); // Save the changes to the database

    return user;
  } catch (error) {
    throw new Error("Failed to update user stripeId: " + error.message);
  }
};

exports.saveChildren = async (data) =>
  await Children.create({
    ...data,
  });

exports.getChildren = async (parentId) => {
  return await Children.findAll({
    where: {
      userId: parentId,
      deleted: false,
    },
    attributes: ["id", "name"],
    raw: true,
  });
};

exports.getChildrenByIdAndParent = async (id, parentId) => {
  return await Children.findAll({
    where: {
      id,
      userId: parentId,
      deleted: false,
    },
    attributes: ["id", "name"],
    raw: true,
  });
};

exports.getAllGymnast = async () => {
  return await UserModel.findAndCountAll({
    where: {
      deleted: false,
    },
    attributes: [
      "id",
      "userName",
      "firstName",
      "lastName",
      "phoneNumber",
      "image",
      "stripeId",
    ],

    include: [
      {
        model: RoleModel,
        attributes: ["id", "name"],
        where: { name: "gymnast" },
      },
    ],
    raw: true,
  });
};
