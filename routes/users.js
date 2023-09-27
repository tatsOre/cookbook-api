const user = require("../controllers/userController");
const { authenticateUserCookieToken } = require("../middleware/authentication");

module.exports = app => {
    app.get('/api/v2/users/me',
        authenticateUserCookieToken,
        user.getCurrentUser
    )

    app.get('/api/v2/users/me/recipes',
        authenticateUserCookieToken,
        user.getCurrentUserRecipes
    )

    app.get('/api/v2/users/me/favorites',
        authenticateUserCookieToken,
        user.getCurrentUserFavorites
    )

    app.patch('/api/v2/users/me/favorites/:id',
        authenticateUserCookieToken,
        user.updateUserFavorites
    )

    app.get('/api/v2/users/:id/profile',
        authenticateUserCookieToken,
        user.getUserProfile
    )

    app.post(
        '/api/v2/users/lookup-email',
        user.lookUpByEmail
    )

    app.delete(
        '/api/v2/users/:id',
        authenticateUserCookieToken,
        user.deleteUser
    )
}
