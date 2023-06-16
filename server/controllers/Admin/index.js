const { sequelize } = require("../../config");
const { getRoleByName, createUser } = require("../../services/auth.service");

const createCoach = async (req, res, next) => {
    try {
        let { email, firstName, lastName } = req.body;
        const transaction = await sequelize.transaction(async (t) => {
            const userName = email.split('@')[0]
            const password = Math.random().toString(36).slice(-10);
            const newUser = await createUser({ userName, email, password, firstName, lastName });
            const savedRole = await getRoleByName('coach')
            await newUser.setRoles([savedRole])
            // send email on success signup here 
            // { }
            return {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                userName: newUser.userName,
                role: { name: savedRole.name }
            }
        })
        return res.status(201).json({
            ...transaction
        })
    } catch (error) {
        next(error)
    }
}
const createSchedule = (req, res, next) => {
    try {

    } catch (error) {
        next(error)
    }
}
module.exports = { createCoach, createSchedule }