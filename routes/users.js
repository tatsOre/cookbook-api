const user = require("../controllers/userController");
const { authenticateUserToken } = require("../middleware/authentication");

module.exports = app => {
    app.get('/api/v2/users/me',
        authenticateUserToken,
        user.getCurrentUser
    )

    app.get('/api/v2/users/me/recipes',
        authenticateUserToken,
        user.getCurrentUserRecipes
    )

    app.get('/api/v2/users/me/favorites',
        authenticateUserToken,
        user.getCurrentUserFavorites
    )

    app.get('/api/v2/users/:id/profile',
        authenticateUserToken,
        user.getUserProfile
    )

    app.post(
        '/api/v2/users/lookup-email',
        user.lookUpByEmail
    )
}
