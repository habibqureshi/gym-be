const { compareSync } = require("bcrypt");
const { sequelize } = require("../../config");

const {
  getByUserNameOrEmail,
  findUserToken,
  generateJWT,
  saveJWT,
  getRoleByName,
  createUser,
  signOut,
} = require("../../services/auth.service");

const { getGymById } = require("../../services/gym.service");

async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await getByUserNameOrEmail(email);
    if (user === "disabled") {
      return res.status(401).json({ message: "User Is Disabled" });
    }
    if (user === null) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const isPasswordValid = compareSync(password, user.dataValues.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const exist = await findUserToken(user.dataValues.id);

    let token = (exist && exist.token) || null;
    if (!token) {
      token = generateJWT(user.dataValues.id);
      await saveJWT(user.dataValues.userName, user.dataValues.id, token);
    }
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        image: user.image,
        status: user.status,
        roles: user.roles.map((item) => {
          return { id: item.dataValues.id, name: item.dataValues.name };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}
const create = async (req, res, next) => {
  try {
    console.log("here");
    let {
      userName,
      email,
      password,
      firstName,
      lastName,
      userType,
      phone,
      gymId,
    } = req.body;
    const transaction = await sequelize.transaction(async (t) => {
      console.log("userType: ", userType);
      const savedRole = await getRoleByName(userType);
      let status = "",
        private;
      if (savedRole) {
        console.log("userType Found");
        if (savedRole.name === "coach") {
          console.log("coach!");
          status = "PENDING_APPROVAL";
          private = false;
        }
      } else {
        console.log("userType Not Found");
        res.sendStatus(400);
      }
      let gym = await getGymById(gymId);
      if (!gym) {
        console.log("Gym Not Found");
        res.sendStatus(400);
      } else {
        console.log("Gym Found");
      }
      const newUser = await createUser({
        userName,
        email,
        password,
        firstName,
        lastName,
        phone,
        status,
        gymId,
        private,
      });

      await newUser.setRoles([savedRole]);
      return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userName: newUser.userName,
        phone: newUser.phone,
        status: newUser.status,
        gymId: newUser.gymId,
        allow_private: newUser.private,
        role: { name: savedRole.name },
      };
    });
    return res.status(201).json({
      ...transaction,
    });
  } catch (error) {
    console.log(`error in creating user, ${JSON.stringify(req.body)}`);
    next(error);
  }
};

const updateUser = async (req, res, next) => {};

const myProfile = async (req, res, next) => {
  try {
    const { currentUser } = req;
    const userRoles = currentUser.roles.map((role) => {
      return role.permissions.map((permission) => {
        return {
          id: permission.id,
          name: permission.name,
          api: permission.api,
        };
      });
    });
    return res
      .status(200)
      .json({ ...JSON.parse(JSON.stringify(currentUser)), roles: userRoles });
  } catch (error) {
    next(error);
  }
};
const signOutUser = async (req, res, next) => {
  try {
    const { currentUser } = req;
    await signOut(currentUser);
    return res
      .status(200)
      .json({ message: `${currentUser.userName} Signed Out Success` });
  } catch (error) {
    next(error);
  }
};
module.exports = { signIn, create, myProfile, signOutUser };
