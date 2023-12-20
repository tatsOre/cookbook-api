const mongoose = require("mongoose")
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, UnauthorizedError } = require("../errors")
const { NOT_FOUND, FORBIDDEN, SUCCESS } = require("../errors/response-messages")

const Recipe = mongoose.model("Recipe")

/**
 * Middleware: findDocument
 * 
 * @description Finds a document by its unique identifier and attaches it to the request object.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @throws {NotFoundError} If the requested document is not found.
 * 
 * @returns {void}
 */
exports.findDocument = async (req, res, next) => {
    const doc = await Recipe.findOne({ _id: req.params.id })

    if (!doc)
        throw new NotFoundError(NOT_FOUND.RESOURCE_NOT_FOUND(req.params.id))

    req.recipe = doc

    next()
}

/**
 * Route Handler: createRecipe
 * Route: POST /api/v2/recipes  
 * 
 * @description Creates a new recipe using the provided request body and
 * associates it with the currently authenticated user.
 * 
 * @returns {void}
 */
exports.createRecipe = async (req, res) => {
    // User comes from middleware authenticateUserCookieToken:
    req.body.author = req.user._id
    const doc = await Recipe.create({ ...req.body })
    res.status(StatusCodes.CREATED).json({ doc: doc._id })
}

/** 
 * Route Handler: getAllRecipes
 * Route: GET /api/v2/recipes
 * Admin only - testing purposes
 */
exports.getAllRecipes = async (req, res) => {
    const query = req.user?.role === "admin" ? {} : { public: true }

    const docs = await Recipe.find(query)

    res.status(StatusCodes.OK).json({ count: docs.length, docs })
}

/**  GET /api/v2/recipe/:id  */
exports.getRecipe = async (req, res) => {
    const authenticatedUser = req.user?._id.toString()
    const author = req.recipe.author._id.toString()

    if ((author === authenticatedUser) || req.recipe.public) {
        return res.status(StatusCodes.OK).json(req.recipe)
    }

    throw new UnauthorizedError(FORBIDDEN)
}

/**
 * Route Handler: updateRecipe
 * Route: PATCH /api/v2/recipe/:id
 * 
 * @description Updates an existing recipe with the specified ID using the provided request body.
 * 
 */
exports.updateRecipe = async (req, res) => {
    // Authorization has already been handled in the middleware that is executed earlier.
    const doc = await Recipe.findOneAndUpdate(
        { _id: req.params.id }, req.body, { runValidators: true }
    )
    res.status(StatusCodes.OK).json({ doc: doc._id })
}

/**
 * Route Handler: updateRecipePrivacy
 * Route: GET /recipes/publish/:id
 * 
 * @description Toggles the privacy status of a recipe document.
 */
exports.updateRecipePrivacy = async (req, res) => {
    // Authorization has already been handled in the middleware that is executed earlier.
    req.recipe.public = !req.recipe.public
    await req.recipe.save()

    res.status(StatusCodes.OK).json({
        doc: req.recipe._id,
        public: req.recipe.public
    })
}

/**
 * DELETE /api/v1/recipe/:id
 */
exports.deleteRecipe = async (req, res) => {
    // Authorization has already been handled in the middleware that is executed earlier.
    await Recipe.findByIdAndDelete({ _id: req.params.id })
    res.status(StatusCodes.OK).json({ message: SUCCESS })
}
/**
 * GET /api/v1/recipes/sort?:key=:value
 * Sort public recipes by query (category|cuisine).
 */
exports.getRecipesByQuery = async (req, res) => {
    const { field, value } = req.query
    const query = new RegExp(value, "gi")
    const recipes = await Recipe.find({
        public: true,
        [field]: query,
    });
    res.json(recipes)
}

/**  GET /api/v2/recipes?sort=asc
 * GET /api/v2/recipes?sort=:value
 */ // filter by query, sort (date)
exports.getLatestRecipes = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 6
    const skip = page * limit - limit;

    const decoded = getUserFromJWT(req) // acá que

    const query = !decoded
        ? { public: true }
        : { public: true, author: { $ne: decoded.user._id } }

    const recipesPromise = Recipe.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: "desc" });

    const countPromise = Recipe.find({ public: true }).count()

    const [recipes, count] = await Promise.all([recipesPromise, countPromise])

    const totalPages = Math.ceil(count / limit)

    res
        .status(StatusCodes.OK)
        .json({ count, page, pages: totalPages, docs: recipes })
};

/**
 * GET /api/v1/recipes/search?q=[query]
 */
exports.searchRecipes = async (req, res) => {
    const { q } = req.query;
    let recipes = [];
    recipes = await Recipe.find(
        {
            public: true,
            $text: { $search: q },
        },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(5);

    if (!recipes.length) {
        recipes = await Recipe.find({
            public: true,
            $or: [
                { title: new RegExp(q, "gi") },
                { categories: new RegExp(q, "gi") },
                { cuisine: new RegExp(q, "gi") },
            ],
        }).limit(5);
    }
    res.json(recipes);
};
