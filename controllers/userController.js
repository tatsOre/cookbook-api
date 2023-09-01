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
    const userID = req.user?._id
    const user = await User.findById(userID)
        .select('name email avatar favorites')
    const recipes = await Recipe.countDocuments({ author: userID })
    const shoppLists = await ShoppingList.countDocuments({ author: userID })

    const data = {
        ...user._doc,
        recipes,
        favorites: user.favorites,
        shoppingLists: shoppLists,
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
        .find({ author: userID }).select('title photo updatedAt public')

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: userID, docs }
    })
};

/**
 * GET /api/v2/users/me/favorites
 * Retrieve current user favorites/saved recipes populated
 */
exports.getCurrentUserFavorites = async (req, res) => {
    const userID = req.user?._id

    const doc = await User.findById(userID)
        .select('favorites').populate('favorites')

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: userID, docs: doc.favorites }
    })
};

/**
 * GET /api/v2/users/me/shopping-lists
 * Retrieve current user shopping lists documents
 */
exports.getCurrentUserShopLists = async (req, res) => {
    const userID = req.user?._id
    // TODO: Populate title in Recipe field
    const docs = await ShoppingList.find({ author: userID }).select('-author')

    res.status(StatusCodes.OK).json({
        message: SUCCESS, data: { user: userID, docs }
    })
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
 * DELETE /api/v2/users/:id/
 */
exports.deleteUser = async (req, res) => {
    // TODO change routes and params with passport authorization
    const { id: userID } = req.params;
    await Recipe.deleteMany({ author: userID });
    await ShoppingList.deleteMany({ author: userID });
    await User.deleteOne({ _id: id });

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
