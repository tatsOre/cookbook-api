const auth = require("../controllers/authController");
const JWT = require('../services/jwt')

module.exports = app => {
    app.get(
        "/api/v2/auth/auth",
        (req, res) => {
            const token = req.cookies[process.env.COOKIE_SECRET]
            const decoded = JWT.verify(token)
            res.json({ token, data: decoded })
        }
    )

    app.post(
        "/api/v2/auth/register",
        auth.register
    )

    app.post(
        "/api/v2/auth/login",
        auth.login,
        auth.setAuthJWTCookie
    )

    app.get('/api/v2/auth/logout', auth.logout)
}
