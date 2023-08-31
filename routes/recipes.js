const recipe = require("../controllers/recipeController");
const { authenticateUserCookieToken } = require("../middleware/authentication");

module.exports = app => {
    app.get("/api/v2/recipes", recipe.getAllRecipes)

    app.post(
        '/api/v2/recipes',
        authenticateUserCookieToken,
        recipe.createRecipe
    )

    app.get(
        "/api/v2/recipes/:id",
        recipe.findDocument, 
        recipe.getRecipe
    )

    app.get(
        "/api/v2/recipes/publish/:id",
        recipe.findDocument, 
        recipe.updateRecipePrivacy
    )

    app.patch(
        "/api/v2/recipes/:id",
        authenticateUserCookieToken,
        recipe.findDocument,
        recipe.updateRecipe
    )

    app.delete(
        "/api/v2/recipes/:id",
        authenticateUserCookieToken,
        recipe.findDocument,
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