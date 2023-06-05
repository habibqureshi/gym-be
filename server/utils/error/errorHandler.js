module.exports = (error, req, res, next) => {
    try {
        console.log(`error : ${error.message}`)
        switch (error.message) {
            case 'Unauthorized':
                res.status(401).send({
                    error: 'Unauthorized',
                    message: "User not Authorized"
                })
                break;
            case '':
                break;
            default:
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