const jwt = require("jsonwebtoken");

const JWT = {
    sign: (payload) => {
        const token = jwt.sign(
            { user: payload, iat: Date.now() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        )
        return token
    },

    verify: (token) => jwt.verify(
        token,
        process.env.JWT_SECRET,
        function (error, decoded) {
            return error ? null : decoded
        }
    )
}

module.exports = JWT
