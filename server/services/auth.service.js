const {
  UserModel,
  UsersTokensModel,
  RoleModel,
  PermissionModel,
  BasicTokensModel,
} = require("../models");

const { Op } = require("../config").Sequelize;
const { sign } = require("jsonwebtoken");
const getByUserNameOrEmail = async (email) => {
  console.log("finding user by email: ", email);
  try {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ email }, { userName: email }],
      },
      include: [
        {
          model: RoleModel,
          attributes: ["name", "id"],
        },
      ],
    });
    if (user && user.deleted === true) {
      return "disabled";
    } else return user;
  } catch (error) {
    throw new Error(error);
  }
};

const findUserToken = async (userId) =>
  await UsersTokensModel.findOne({
    where: {
      userId,
    },
    raw: true,
  });

const getUserDetailsByToken = async (token) => {
  return await UsersTokensModel.findOne({
    where: { token },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: [
          "id",
          "userName",
          "firstName",
          "lastName",
          "email",
          "enable",
          "deleted",
        ],
        include: [
          {
            model: RoleModel,
            as: "roles",
            where: { deleted: false },
            attributes: ["id", "name"],
            include: [
              {
                model: PermissionModel,
                attributes: ["id", "name", "api"],
                as: "permissions",
              },
            ],
          },
        ],
      },
    ],
  });
};
const generateJWT = (id) => sign({ id }, process.env.JWT_SECRET);

const saveJWT = async (userName, userId, token) =>
  await UsersTokensModel.create({ userName, userId, token });

const allowedToAccessResource = (user, requestedResource) => {
  return user.roles.reduce((result, role) => {
    console.log("request: ", requestedResource);
    role.dataValues.permissions.forEach((permission) => {
      console.log("role: ", permission.dataValues.api);
      if (permission.dataValues.api === requestedResource) result = true;
    });
    return result;
  }, false);
};
const getAllRoles = async () =>
  await RoleModel.findAll({
    where: {
      name: { [Op.in]: roles },
      deleted: false,
    },
  });
const getRoleByName = async (role) =>
  await RoleModel.findOne({
    where: {
      name: role,
      deleted: false,
    },
  });

const createUser = async (data) => await UserModel.create({ ...data });

const signOut = async (currentUser) => {
  await UsersTokensModel.destroy({
    where: {
      userId: currentUser.id,
    },
  });
};
const getBasicTokenByClientId = async (id) =>
  await BasicTokensModel.findOne({
    where: {
      client_id: id,
    },
    raw: true,
  });
module.exports = {
  getByUserNameOrEmail,
  getAllRoles,
  createUser,
  findUserToken,
  generateJWT,
  saveJWT,
  getUserDetailsByToken,
  allowedToAccessResource,
  signOut,
  getBasicTokenByClientId,
  getRoleByName,
};
