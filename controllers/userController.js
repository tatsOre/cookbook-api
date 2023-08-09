const mongoose = require("mongoose");
const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require("../errors");
const {
    INVALID_FORMAT, SUCCESS, FAILURE
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
        emailExist: doc ? true : false
    })
}

/**
 * GET /api/v2/users/me
 * Retrieve user profile information.
 */
exports.getCurrentUser = async (req, res) => {
    // const req.user._id will be the verified doc against jwt token
    const _id = req.user?._id || '624e14a6693762201a694070'
    const user = await User.findById(_id).select('name email avatar favorites')
    const recipes = await Recipe.countDocuments({ author: _id })
    const shopLists = await ShoppingList.countDocuments({ author: _id })

    const data = {
        ...user._doc,
        recipes,
        favorites: user.favorites.length,
        shoppingLists: shopLists
    }

    res.status(StatusCodes.OK).json({ message: SUCCESS, data })
};

/**
 * GET /api/v2/users/me/recipes
 * Retrieve current user recipes populated
 */
exports.getCurrentUserRecipes = async (req, res) => {
    // const req.user._id will be the verified doc against jwt token
    // todo: add pagination
    const _id = req.user?._id || '624e14a6693762201a694070'

    const docs = await Recipe
        .find({ author: _id }).select('title photo updatedAt')

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: _id, docs }
    })
};

/**
 * GET /api/v2/users/me/favorites
 * Retrieve current user favorites/saved recipes populated
 */
exports.getCurrentUserFavorites = async (req, res) => {
    // const req.user._id will be the verified doc against jwt token
    // todo: add pagination
    const _id = req.user?._id || '624e14a6693762201a694070'

    const doc = await User.findById(_id).populate({
        path: 'favorites',
        select: 'title photo updatedAt',
        populate: [{ path: 'author', select: 'name' }]
    })

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: _id, docs: doc.favorites }
    })
};

/**
 * GET /api/v2/users/me/shopping-lists
 * Retrieve current user shopping lists documents
 */
exports.getCurrentUserShopLists = async (req, res) => {
    // const req.user._id will be the verified doc against jwt token
    // todo: add pagination
    const _id = req.user?._id || '624e14a6693762201a694070'
    // TODO: Populate title in Recipe field
    const docs = await ShoppingList.find({ author: _id }).select('-author')

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: _id, docs }
    })
};

/**
 * GET /api/v2/users/:id/profile
 * Retrieve user public profile/account information.
 * No Auth Required
 */
exports.getUserProfile = async (req, res) => {
    const _id = req.params.id || '624e14a6693762201a694070'
    const doc = await User.findById(_id)
        .select("name about avatar")

    const recipes = await Recipe.find({ author: _id, public: true })
        .select('title photo updatedAt')

    res.status(StatusCodes.OK).json({
        message: SUCCESS,
        data: { _id, name: doc.name, recipes }
    })
};

/** // TODO change route to /api/v1/me/update
 * PATCH /api/v1/user/:id/update
 * Update user.
 */
exports.updateUser = async (req, res) => {
    // TODO change routes and params with passport authorization
    const { id } = req.params;
    const user = await UserModel.findOneAndUpdate({ _id: id }, req.body, {
        runValidators: true,
        new: true,
    });

    res.json({ message: "Your profile information has been updated", user });
};

/** TODO change route to /api/v1/me/delete
 * DELETE /api/v1/user/:id/delete
 * Delete user.
 */
exports.deleteUser = async (req, res) => {
    // TODO change routes and params with passport authorization
    const { id: userID } = req.params;
    await RecipeModel.deleteMany({ author: userID });
    await ShoppingListModel.deleteMany({ author: userID });
    await UserModel.deleteOne({ _id: id });

    res.status(StatusCodes.OK).json({ message: SUCCESS });
};

/**
 * POST /api/v1/me/favorites
 * Add/Remove a recipe to/from user favorites.
 */
exports.updateFavorites = async (req, res) => {
    const favorites = req.user.favorites.map((obj) => obj.toString());
    const operator = favorites.includes(req.body.recipe) ? "$pull" : "$addToSet";
    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        { [operator]: { favorites: req.body.recipe } },
        { new: true }
    );

    return res.json(user);
};

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
