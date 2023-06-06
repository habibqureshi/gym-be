const { UserModel, UsersTokensModel } = require('../../models')
const { Op } = require('../../config').Sequelize
const { compareSync, hashSync } = require('bcrypt')
const { sequelize } = require('../../config')
const { sign } = require('jsonwebtoken')
const hashSalt = 8
async function signIn(req, res, next) {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { userName: email }
                ],
                deleted: false
            }
        })

        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        const isPasswordValid = compareSync(password, user.dataValues.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' })
        }
        const exist = await UsersTokensModel.findOne(
            {
                where: {
                    userId: user.dataValues.id,
                },
                raw: true
            }
        );
        let token = exist && exist.token || null
        if (!token) {
            token = sign(
                {
                    id: user.id,
                },
                process.env.JWT_SECRET
            );

            await UsersTokensModel.create(
                {
                    userName: user.dataValues.userName,
                    userId: user.dataValues.id,
                    token
                }
            );

        }
        return res.status(200).json({ token })

        // const token = sign({ id: user.id }, process.env.JWT_SECRET)
    } catch (error) {
        next(error)
    }
}
const create = async (req, res, next) => {
    try {
        let { userName, email, password, name } = req.body
        const transaction = await sequelize.transaction(async (t) => {
            password = hashSync(password, hashSalt);
            return await UserModel.create({ userName, email, password, name });
        })
        return res.status(201).json({
            user: transaction
        })
    } catch (error) {
        console.log(`error in creating user, ${JSON.stringify(error)}`);
        next(error)
    }
};
const myProfile = async (req, res, next) => {
    try {
        return res.status(200).json(req.currentUser)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
module.exports = { signIn, create, myProfile }