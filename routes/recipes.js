const recipe = require("../controllers/recipeController");
const auth = require("../middleware/authentication");

module.exports = app => {
    app.get("/api/v2/recipes",
        auth.verifyUserCookieToken,
        recipe.getAllRecipes
    )

    app.post(
        '/api/v2/recipes',
        auth.authenticateUserCookieToken,
        recipe.createRecipe
    )

    app.get(
        "/api/v2/recipes/:id",
        recipe.findDocument,
        auth.verifyUserCookieToken,
        recipe.getRecipe
    )

    app.patch(
        "/api/v2/recipes/publish/:id",
        auth.authenticateUserCookieToken,
        recipe.findDocument,
        auth.verifyAuthorization,
        recipe.updateRecipePrivacy
    )

    app.patch(
        "/api/v2/recipes/:id",
        auth.authenticateUserCookieToken,
        recipe.findDocument,
        auth.verifyAuthorization,
        recipe.updateRecipe
    )

    app.delete(
        "/api/v2/recipes/:id",
        auth.authenticateUserCookieToken,
        recipe.findDocument,
        auth.verifyAuthorization,
        recipe.deleteRecipe
    )

    // Admin Level
    app.get("/api/v2/recipes-all",
        auth.verifyUserCookieToken,
        recipe.findAllDocuments
    )
}
