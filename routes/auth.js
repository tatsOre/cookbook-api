const auth = require("../controllers/authController");

module.exports = app => {
    app.get(
        "/api/v2/auth/auth",
        (req, res) => {
            console.log(req.cookies)
            const token = req.cookies[process.env.COOKIE_SECRET]
            const decoded = auth.verifyJWT(token)
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
        auth.signJWT
    )

    app.get('/api/v2/auth/logout', auth.logout)
}
