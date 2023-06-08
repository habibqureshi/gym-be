const { UserModel, UsersTokensModel, RoleModel } = require('../../models')
const { Op } = require('../../config').Sequelize
const { compareSync } = require('bcrypt')
const { sequelize } = require('../../config')

const { getByUserNameOrEmail, findUserToken, generateJWT, saveJWT } = require('../../services/auth.service')
async function signIn(req, res, next) {
    try {
        const { email, password } = req.body
        const user = await getByUserNameOrEmail(email)
        if (user === 'disabled') {
            return res.status(401).json({ error: 'User Is Disabled' })
        }
        if (user === null) {
            return res.status(401).json({ error: 'User Not Found' })
        }
        const isPasswordValid = compareSync(password, user.dataValues.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' })
        }
        const exist = await findUserToken(user.dataValues.id)

        let token = exist && exist.token || null
        if (!token) {
            token = generateJWT(user.dataValues.id)
            await saveJWT(user.dataValues.userName, user.dataValues.id, token)
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
                roles: user.roles.map(item => { return { id: item.dataValues.id, name: item.dataValues.name } })
            }
        })
    } catch (error) {
        next(error)
    }
}
const create = async (req, res, next) => {
    try {
        let { userName, email, password, firstName, lastName, roles } = req.body
        const transaction = await sequelize.transaction(async (t) => {
            const newUser = await UserModel.create({ userName, email, password, firstName, lastName });
            const savedRoles = await RoleModel.findAll({
                where: {
                    name: { [Op.in]: roles },
                    deleted: false
                }
            })
            if (roles) assignedRoles = await newUser.setRoles(savedRoles.map(item => item.dataValues.id))
            return {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userName: newUser.userName,
                roles: savedRoles.map(item => { return { id: item.dataValues.id, name: item.dataValues.name } })
            }
        })
        return res.status(201).json({
            ...transaction
        })
    } catch (error) {
        console.log(`error in creating user, ${JSON.stringify(req.body)}`);
        next(error)
    }
};
const myProfile = async (req, res, next) => {
    try {
        return res.status(200).json(req.currentUser)
    } catch (error) {
        next(error)
    }
}
module.exports = { signIn, create, myProfile }