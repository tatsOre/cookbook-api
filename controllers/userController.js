const mongoose = require("mongoose");
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthorizedError } = require("../errors");
const {
    INVALID_FORMAT, SUCCESS, FAILURE, UNAUTHORIZED
} = require("../errors/response-messages")

const User = mongoose.model("User");
const Recipe = mongoose.model("Recipe")
const ShoppingList = mongoose.model("ShoppingList");

exports.lookUpByEmail = async (req, res) => {
    const { email } = req.body

    if (!email) throw new BadRequestError(INVALID_FORMAT.MISSING_CREDENTIALS)

    const doc = await User.findOne({ email })

    res.status(StatusCodes.OK).json({
        message: doc ? SUCCESS : FAILURE,
        displayName: email,
        userExists: doc ? true : false
    })
}

/**
 * GET /api/v2/users/me
 * Retrieve user profile information.
 */
exports.getCurrentUser = async (req, res) => {
    const { name, email, about, avatar, favorites, _id } = req.user

    const recipes = await Recipe.countDocuments({ author: _id })
    const shoppingLists = await ShoppingList.countDocuments({ author: _id })

    const data = {
        _id,
        name,
        about,
        avatar,
        email,
        recipes,
        favorites,
        shoppingLists,
        isLoggedIn: true
    }

    res.status(StatusCodes.OK).json(data)
};

/**
 * GET /api/v2/users/me/recipes
 * Retrieve current user recipes populated
 */
exports.getCurrentUserRecipes = async (req, res) => {
    const userID = req.user?._id

    const docs = await Recipe
        .find({ author: userID }).select('title photo createdAt updatedAt public')

    res.status(StatusCodes.OK).json({ user: userID, docs })
};

/**
 * GET /api/v2/users/me/favorites
 * Retrieve current user favorites/saved recipes populated
 */
exports.getCurrentUserFavorites = async (req, res) => {
    const userID = req.user?._id

    const doc = await User.findById(userID)
        .select('favorites').populate('favorites')

    res.status(StatusCodes.OK).json({ user: userID, docs: doc.favorites })
};

/**
 * GET /api/v2/users/me/shopping-lists
 * Retrieve current user shopping lists documents
 */
exports.getCurrentUserShopLists = async (req, res) => {
    const userID = req.user?._id
    // TODO: Populate title in Recipe field
    const docs = await ShoppingList.find({ author: userID }).select('-author')

    res.status(StatusCodes.OK).json({ user: userID, docs })
};

/**
 * GET /api/v2/users/:id/profile
 * Retrieve user public profile/account information.
 * No Auth Required
 */
exports.getUserProfile = async (req, res) => {
    const userID = req.user?._id

    const doc = await User.findById(userID)
        .select("name about avatar")

    const recipes = await Recipe.find({ author: userID, public: true })
        .select('title photo updatedAt')

    res.status(StatusCodes.OK).json({
        message: SUCCESS,
        data: { _id: userID, name: doc.name, recipes }
    })
};

/**
 * PATCH /api/v2/users/:id
 */
exports.updateUser = async (req, res) => {
    const userID = req.user?._id

    const user = await UserModel.findOneAndUpdate({ _id: userID }, req.body, {
        runValidators: true,
        new: true,
    });

    res.status(StatusCodes.OK).json({ message: SUCCESS })
};

/**
 * PATCH /api/v2/users/me/favorites/:id
 * Add/Remove a recipe to/from user favorites.
 */
exports.updateUserFavorites = async (req, res) => {
    const recipeId = req.params.id
    const favorites = req.user.favorites.map((obj) => obj.toString())
    const operator = favorites.includes(recipeId) ? "$pull" : "$addToSet"

    await User.findByIdAndUpdate(
        req.user._id,
        { [operator]: { favorites: recipeId } },
        { new: true }
    )

    res.status(StatusCodes.OK).json({ message: SUCCESS })
}

/**
 * DELETE /api/v2/users/:id/
 */
exports.deleteUser = async (req, res) => {
    const userID = req.user?._id

    // Logged in user is dif from request id
    if (userID.toString() !== req.params.id) {
        throw new UnauthorizedError(UNAUTHORIZED)
    }

    await Recipe.deleteMany({ author: userID })
    await ShoppingList.deleteMany({ author: userID })
    await User.deleteOne({ _id: userID })

    return res.status(StatusCodes.OK).send({ message: SUCCESS })
}

/**
 * GET /api/v1/me/search?field=:field&q=:queryParam
 * field: [recipes || favorites]
 */
exports.searchUserRecipes = async (req, res) => {
    const { field, q } = req.query;

    const user = await UserModel.findOne({
        _id: req.user._id,
    }).populate({
        path: field,
        select: "-author",
        match: {
            $or: [
                { title: new RegExp(q, "gi") },
                { categories: new RegExp(q, "gi") },
                { cuisine: new RegExp(q, "gi") },
            ],
        },
    });

    res.json(user[field]);
};
