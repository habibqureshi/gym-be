const { UserModel, UsersTokensModel, RoleModel } = require('../models')
const { Op } = require('../config').Sequelize
const { sign } = require('jsonwebtoken')
const getByUserNameOrEmail = async (email) => {
    try {
        const user = await UserModel.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { userName: email }
                ]
            },
            include: [
                {
                    model: RoleModel,
                    attributes: ['name', 'id'],
                }
            ]
        })
        if (user && user.deleted === true) {
            return 'disabled'
        }
        else return user
    } catch (error) {
        throw new Error(error)
    }
}
const findUserToken = async (userId) => await UsersTokensModel.findOne(
    {
        where: {
            userId,
        },
        raw: true
    }
);

const generateJWT = (id) => sign({ id }, process.env.JWT_SECRET)

const saveJWT = async (userName, userId, token) => await UsersTokensModel.create({ userName, userId, token })

module.exports = { getByUserNameOrEmail, findUserToken, generateJWT, saveJWT }