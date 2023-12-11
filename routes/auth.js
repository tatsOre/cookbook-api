const auth = require("../controllers/authController");

module.exports = app => {
    app.post(
        "/api/v2/auth/register",
        auth.register,
        auth.setAuthJWTCookie
    )

    app.post(
        "/api/v2/auth/login",
        auth.login,
        auth.setAuthJWTCookie
    )

    app.get('/api/v2/auth/logout', auth.logout)
}
