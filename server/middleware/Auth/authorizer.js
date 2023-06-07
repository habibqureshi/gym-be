const { BasicTokensModel, UsersTokensModel, UserModel, RoleModel, PermissionModel } = require('../../models');

const { compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const authSecret = process.env.AUTH_SECRET || "6472090aa02359fc74511149"
const authorizer = async (req, res, next) => {
    try {
        const authToken = req.headers.Authorization || req.headers.authorization;
        if (!authToken)
            return res.status(401).json({
                message: "Authorization Token Not Found",
            });
        const token = authToken.split(" ");
        if (token[0].trim() === "Basic") {
            return await handleAuthRoutes({ token: token[1].trim(), req, res, next });
        } else if (token[0] === "Bearer")
            return await handleBearer({ token: token[1].trim(), req, res, next });
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
const handleBearer = async ({ token, req, res, next }) => {
    try {
        const isTokenExist = await UsersTokensModel.findOne({
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
                        "deleted"
                    ],
                    where: { deleted: false },
                    include: [
                        {
                            model: RoleModel,
                            as: "roles",
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
        if (!isTokenExist) next(new Error("Unverified Token Found in Request"));
        jwt.verify(token, process.env.JWT_SECRET);
        req.currentUser = isTokenExist.user
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