module.exports = (error, req, res, next) => {
    try {
        console.log(Object.keys(error))
        console.log(error.message)
        console.log(`Error : ${error.message}`)
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
                break;
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