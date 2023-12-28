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

    app.patch('/api/v2/users/me/change-password',
        authenticateUserCookieToken,
        user.updateUserPassword
    )

    app.patch('/api/v2/users/me/update-profile',
        authenticateUserCookieToken,
        user.updateUserProfile
    )

    app.patch('/api/v2/users/me/favorites/:id',
        authenticateUserCookieToken,
        user.updateUserFavorites
    )

    app.get('/api/v2/users/:id/profile',
        user.getUserPublicProfile
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
