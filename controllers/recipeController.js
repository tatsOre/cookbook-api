const mongoose = require("mongoose")
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, UnauthorizedError } = require("../errors")
const { NOT_FOUND, SUCCESS } = require("../errors/response-messages")
const Recipe = mongoose.model("Recipe")

exports.findDocument = async (req, res, next) => {
    const doc = await Recipe.findOne({ _id: req.params.id })
    if (doc) {
        req.recipe = doc
        next()
    } else {
        throw new NotFoundError(NOT_FOUND.RESOURCE_NOT_FOUND(req.params.id))
    }
}

/**  
 * GET /api/v2/recipes  
 * Admin level only
 */
exports.getAllRecipes = async (req, res) => {
    //"624e14a6693762201a694070"
    const docs = await Recipe.find({})
    res.status(StatusCodes.OK).json({ count: docs.length, data: docs })
}

/**  POST /api/v2/recipe  */
exports.createRecipe = async (req, res) => {
    req.body.author = req.user?._id
    const doc = await Recipe.create({ ...req.body })
    res.status(StatusCodes.CREATED).json({ message: SUCCESS, id: doc._id })
}

/**  GET /api/v2/recipe/:id  */
exports.getRecipe = async (req, res) => {
    /**
        new param: .../:id?view=true
    
        if (req.recipe.author === authenticatedUser) {
            send recipe
        } else {
            if (param.view === true && req.recipe.public === true) {
                send recipe
            } else {
                forbidden
            }
        }
     */
    res.status(StatusCodes.OK).json({ message: SUCCESS, data: req.recipe })
}

/**  PATCH /api/v2/recipe/:id  */
exports.updateRecipe = async (req, res) => {
    const authenticatedUser = req.user._id
    const { author } = req.body

    if (author._id !== authenticatedUser.toString()) {
        throw new UnauthorizedError()
    }

    const doc = await Recipe.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { runValidators: true }
    )

    res.status(StatusCodes.OK).json({ message: SUCCESS, id: doc._id })
}

/**
 * DELETE /api/v1/recipe/:id
 */
exports.deleteRecipe = async (req, res) => {
    await Recipe.findByIdAndDelete({ _id: req.params.id })
    res.status(StatusCodes.OK).send({ message: SUCCESS })
}

/**
 * 
 * GET /recipes/publish/:id
 */

exports.updateRecipePrivacy = async (req, res) => {
    req.recipe.public = !req.recipe.public
    req.recipe.save()
    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: {
            _id: req.recipe._id,
            public: req.recipe.public
        }
    })
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

    const decoded = getUserFromJWT(req)

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

    res.json({ total: count, pages: totalPages, page, recipes })
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
