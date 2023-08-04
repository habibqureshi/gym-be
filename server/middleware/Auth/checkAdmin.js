module.exports = function (req, res, next) {
  try {
    console.log(req.currentUser.dataValues.roles[0].dataValues.name);
    // console.log(req.currentUser.dataValues);
    if (req.currentUser.dataValues.roles[0].dataValues.name.includes("admin")) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "only admin allowed to access this resource" });
    }
  } catch (error) {
    next(error);
  }
};
