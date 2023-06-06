const { BasicTokensModel, UsersTokensModel, UserModel } = require('../../models');

const { compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const authSecret = process.env.AUTH_SECRET || "6472090aa02359fc74511149"
const authorizer = async (req, res, next) => {
    try {
        console.log(req.body)
        const authToken = req.headers.Authorization || req.headers.authorization;
        if (!authToken)
            return res.status(401).json({
                message: "Authorization Token Not Found",
            });
        const token = authToken.split(" ");
        if (token[0].trim() === "Basic") {
            return await handleAuthRoutes({ token: token[1].trim(), req, res, next });
        } else if (token[0] === "Bearer")
            return await handleBearer({ token: token[1].trim(), req, res });
        else return res.status(401).json({
            message: "UnAuthorization",
        });
    } catch (error) {
        next(error)
    }
};

const handleAuthRoutes = async ({ token, req, res, next }) => {
    const decodedToken = Buffer.from(token, "base64").toString();
    const usernamePassword = decodedToken.split(":");
    if (usernamePassword.length !== 2) throw Error("unauthorized");
    console.log(`usernamePassword[0] ${usernamePassword[0]}`);
    const client = await BasicTokensModel.findOne({
        where: { client_id: usernamePassword[0] },
    });
    console.log(`client ${JSON.stringify(client)}`);
    let passwordIsValid = compareSync(
        usernamePassword[1],
        client.clientSecret
    );
    console.log(`is password valid ${passwordIsValid}`);
    if (!passwordIsValid) {
        return res.status(401).json({
            message: "Authentication Failed, Invalid Token",
        });
    }
    next()
};
const handleBearer = async ({ token, req, res }) => {
    try {
        const isTokenExist = await UsersTokensModel.findOne({
            where: {
                token: token
            },
            include: [
                {
                    model: UserModel,
                    as: "user",
                    attributes: ["name", "userName", "password", "email"]
                }
            ]
        })
        if (!isTokenExist) next(new Error("Unverified Token Found in Request"));
        if (!isTokenExist.user.enable || isTokenExist.user.deleted)
            next(new Error("User is not enabled"))
        req.currentUser = jwt.verify(token, authSecret);
        next()
    } catch (error) {
        if (error == 'jwt expired') {
            try {
                await oAuthTokens.destroy({ where: { token } })
            }
            catch (error) {
                console.log(`error while authenticating user (Token expired) ${error}`);
                next(error);
            }
        }
        console.log(`error while authenticating user ${error}`)
        next(error)
    };
}
module.exports = { authorizer }