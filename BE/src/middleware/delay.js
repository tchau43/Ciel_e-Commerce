
const delay = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
    };
    setTimeout(() => {
        next();
    }, 1000)
}

module.exports = delay;