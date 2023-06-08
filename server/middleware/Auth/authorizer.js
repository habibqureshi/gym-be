const { compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserDetailsByToken, allowedToAccessResource, getBasicTokenByClientId } = require('../../services/auth.service');
const authorizer = async (req, res, next) => {
    try {
        const authToken = req.headers.Authorization || req.headers.authorization;
        if (!authToken)
            return res.status(401).json({
                message: "Authentication Token Not Found",
            });
        const token = authToken.split(" ");
        if (token[0].trim() === "Basic") {
            return await handleAuthRoutes({ token: token[1].trim(), req, res, next });
        } else if (token[0] === "Bearer")
            return await handleBearer({ token: token[1].trim(), req, res, next });
        else return res.status(401).json({
            message: "Unauthorized",
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
    const client = await getBasicTokenByClientId(usernamePassword[0])
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
        const isTokenExist = await getUserDetailsByToken(token);
        if (!isTokenExist) next(new Error("Unverified Token Found in Request"));
        const { user } = isTokenExist
        jwt.verify(token, process.env.JWT_SECRET);
        const requestedResource = `${req.method}:/${req.originalUrl.split('api/')[1].split('?')[0]}`
        const isAllowed = allowedToAccessResource(user, requestedResource)
        if (!isAllowed) {
            return res.status(401).json({
                message: "Not authorized to access this resource"
            })
        }
        req.currentUser = user
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