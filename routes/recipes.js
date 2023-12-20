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
}

/**
 * GET /api/v1/recipes
 * Retrieve the list of all public recipe items with optional pagination.
 * EX: http://localhost:3000/api/v1/recipes?page=2&limit=2
 */
//router.get("/recipes", catchErrors(recipeController.getRecipes));

/**
 * GET /api/v1/recipes/filter?:query
 * Sort public recipes by query (category|cuisine).
 */
//router.get("/recipes/sort", catchErrors(recipeController.getRecipesByQuery));

/**
 * GET /api/v1/recipes?sort=asc
 */
//router.get("/recipes/latest", catchErrors(recipeController.getLatestRecipes));

/**
 * GET /api/v1/recipe/:id
 */
//router.get("/recipe/:id", catchErrors(recipeController.getOneRecipe));

/**
 * POST /api/v1/recipe
 */



/**
 * GET /api/v1/recipes/search?q=[query]
 */
//router.get("/recipes/search", catchErrors(recipeController.searchRecipes));