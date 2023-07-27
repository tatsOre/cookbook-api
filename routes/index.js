
const router = require("express").Router();

const { catchErrors } = require("../lib/errorHandlers");
/*
  Index
*/

router.get("/", (req, res) => {
  res.json({ message: "Welcome to CookBook App" });
});

/*
  Routes for User Controller
*/
const userController = require("../controllers/userController");

/**
 * GET /api/v1/user/me
 * Retrieve user profile information.
 */
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.getCurrentUser
);

/**
 * GET /api/v1/me/recipes
 * Retrieve user recipes.
 */
router.get(
  "/me/recipes",
  passport.authenticate("jwt", { session: false }),
  catchErrors(userController.getUserRecipes)
);

/**
 * GET /api/v1/me/favorites
 * Retrieve user favorites.
 */
router.get(
  "/me/favorites",
  passport.authenticate("jwt", { session: false }),
  catchErrors(userController.getFavorites)
);

/**
 * POST /api/v1/me/favorites
 * Add/Remove a recipe to/from user favorites.
 */
router.post(
  "/me/favorites",
  passport.authenticate("jwt", { session: false }),
  catchErrors(userController.updateFavorites)
);

/**
 * GET /api/v1/me/search?field=:field&q=:queryParam
 * EX: http://localhost:3000/api/v1/me/search?field=recipes&q=pasta
 */
router.get(
  "/me/search",
  passport.authenticate("jwt", { session: false }),
  catchErrors(userController.searchUserRecipes)
);

/**
 * GET /api/v1/user/:id
 * Retrieve user public profile information.
 */
router.get("/user/:id", catchErrors(userController.getOneUser));

/**
 * PATCH /api/v1/user/:id
 * Update user.
 */
router.patch("/user/:id", catchErrors(userController.updateOneUser));

/**
 * DELETE /api/v1/user/:id
 * Delete user.
 */
router.delete("/user/:id", catchErrors(userController.deleteOneUser));





/*
  Routes for Shopping Lists
*/
const shopListsController = require("../controllers/shopListsController");

/**
 * GET /api/v1/me/shopping_lists
 * Retrieve user shopping lists.
 */
router.get(
  "/me/shopping_lists",
  passport.authenticate("jwt", { session: false }),
  catchErrors(shopListsController.getShopLists)
);

/**
 * POST /api/v1/me/shopping_lists
 * Add shopping list item
 */
router.post(
  "/me/shopping_lists",
  passport.authenticate("jwt", { session: false }),
  catchErrors(shopListsController.addOneShoppingList)
);

/**
 * PATCH /api/v1/me/shopping_lists/:id
 * Update a shopping list item
 */
router.patch(
  "/me/shopping_lists/:id",
  passport.authenticate("jwt", { session: false }),
  catchErrors(shopListsController.updateOneShoppingList)
);

/**
 * DELETE /api/v1/me/shopping_lists
 * Delete a shopping list item
 */
router.delete(
  "/me/shopping_lists/:id",
  passport.authenticate("jwt", { session: false }),
  catchErrors(shopListsController.deleteOneShoppingList)
);

module.exports = router;
