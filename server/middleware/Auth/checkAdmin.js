module.exports = function (req, res, next) {
    try {
        if (req.currentUser.includes('admin')) {
            next()
        }
        else {
            return res.status(403).json({ message: "only admin allowed to access this resource" })
        }
    } catch (error) {
        next(error)
    }
}