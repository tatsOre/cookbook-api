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
 * Route Handler: getAllDocuments
 * Route: GET /api/v2/recipes-all
 * Admin only - testing purposes
 */
exports.findAllDocuments = async (req, res) => {
    const query = req.user?.role === "admin" ? {} : { public: true }

    const docs = await Recipe.find(query)

    res.status(StatusCodes.OK).json({ count: docs.length, docs })
}

/**
 * Route Handler: getRecipe
 * GET /api/v2/recipe/:id
 */

exports.getRecipe = async (req, res) => {
    const authenticatedUser = req.user?._id.toString()
    const author = req.recipe.author._id.toString()

    if ((author === authenticatedUser) || req.recipe.public) {
        return res.status(StatusCodes.OK).json(req.recipe)
    }

    throw new UnauthorizedError(FORBIDDEN)
}

/**  
 * Route Handler: getAllRecipes
 * GET /api/v2/recipes?page=2&limit=2&sort=title,-updatedAt (EX)
 * fields with minus(-) == -1 == desc
 */

exports.getAllRecipes = async (req, res) => {
    const { sort } = req.query

    const authenticatedUser = req.user?._id

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = page * limit - limit

    const query = authenticatedUser
        ? { public: true, author: { $ne: authenticatedUser } }
        : { public: true }

    // Mongo sort is case sensitive..., with locale the issue is temp "solved"
    let recipesPromise = Recipe.find(query).collation({ locale: "en" })

    if (sort) {
        const sortList = sort.split(',').join(' ')
        recipesPromise = recipesPromise.sort(sortList)
    } else {
        recipesPromise = recipesPromise.sort({ createdAt: -1 })
    }

    recipesPromise = recipesPromise.skip(skip).limit(limit)

    const countPromise = Recipe.find(query).count()

    const [recipes, count] = await Promise.all([recipesPromise, countPromise])

    res
        .status(StatusCodes.OK)
        .json({ count, page, pages: Math.ceil(count / limit), docs: recipes })
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
 * GET /api/v1/recipes/search?q=[query]
 */
exports.searchRecipes = async (req, res) => {
    const { q } = req.query;
    let recipes = []

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
}
