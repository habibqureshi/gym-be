const validateEmail = (mail) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) ? true : false
const getOffset = ({ limit, page }) => {
    return (page - 1) * limit
}
module.exports = { validateEmail, getOffset }