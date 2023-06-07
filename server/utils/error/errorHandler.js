module.exports = (error, req, res, next) => {
    try {
        console.log(Object.keys(error))
        console.log(`Error Message: ${error.message}`)
        console.log(`Error Name: ${error.name}`)
        switch (error.name) {
            case 'Unauthorized':
                return res.status(401).send({
                    error: 'Unauthorized',
                    message: "User not Authorized"
                })
            case 'BadRequest':
                return res.status(400).send({
                    error: error.name,
                    message: error.message
                })
            case 'SequelizeUniqueConstraintError':
                return res.status(400).send({
                    error: error.name,
                    message: `${error.errors[0].value} is already in use`
                })
            case 'JsonWebTokenError':
                return res.status(401).send({
                    error: 'Unauthorized',
                    message: `Invalid Token`
                })
            default:
                console.log(error)
                res.status(500).json({
                    message: 'Internal Server Error'
                })
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}