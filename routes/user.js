const user = require("../controllers/userController");

module.exports = app => {
    app.post(
        '/api/v2/user/lookup-email',
        user.lookUpByEmail
    )
}
