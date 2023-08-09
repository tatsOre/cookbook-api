const user = require("../controllers/userController");

module.exports = app => {
    app.get('/api/v2/users/me',
        user.getCurrentUser
    )

    app.get('/api/v2/users/me/recipes',
        user.getCurrentUserRecipes
    )

    app.get('/api/v2/users/me/favorites',
        user.getCurrentUserFavorites
    )

    app.get('/api/v2/users/:id/profile',
        user.getUserProfile
    )

    app.post(
        '/api/v2/users/lookup-email',
        user.lookUpByEmail
    )
}
