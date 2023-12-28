const mongoose = require("mongoose");
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthorizedError } = require("../errors");
const {
    INVALID_FORMAT, SUCCESS, FAILURE, UNAUTHORIZED
} = require("../errors/response-messages")

const User = mongoose.model("User");
const Recipe = mongoose.model("Recipe")
const ShoppingList = mongoose.model("ShoppingList");

/**
 * Middleware: lookUpByEmail
 * 
 */
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
 * GET /api/v2/users/:id/profile
 * Retrieve user public profile/account information.
 * No Auth Required
 */
exports.getUserPublicProfile = async (req, res) => {
    const user = req.params.id

    const doc = await User.findById(user)

    const recipes = await Recipe.find({ author: user, public: true })
        .select('title photo -author')

    res.status(StatusCodes.OK).json({
        _id: doc._id,
        name: doc.name,
        about: doc.about,
        avatar: doc.avatar,
        recipes,
    })
}

/**
 * Route Handler: getCurrentUser
 * Route: GET /api/v2/users/me
 * 
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
 * Route Handler: getCurrentUserRecipes
 * GET /api/v2/users/me/recipes
 * Retrieve current user recipes populated
 */
exports.getCurrentUserRecipes = async (req, res) => {
    const authenticatedUser = req.user?._id

    const docs = await Recipe
        .find({ author: authenticatedUser })
        .select('title photo createdAt updatedAt public')

    res
        .status(StatusCodes.OK)
        .json({ user: authenticatedUser, docs })
};

/**
 * Route Handler: getCurrentUserFavorites
 * GET /api/v2/users/me/favorites
 * Retrieve current user favorites/saved recipes populated
 */
exports.getCurrentUserFavorites = async (req, res) => {
    const authenticatedUser = req.user?._id

    const doc = await User.findById(authenticatedUser)
        .populate({ path: 'favorites', select: 'photo title' })

    res
        .status(StatusCodes.OK)
        .json({ user: authenticatedUser, docs: doc.favorites })
};

/**
 * Route Handler: updateUserPassword
 * PATCH /api/v2/users/me/change-password
 * Retrieve current user favorites/saved recipes populated
 */
exports.updateUserPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body
    const authenticatedUser = req.user._id

    if (!newPassword || !confirmPassword) {
        const responseMsg = newPassword ? 'Confirm Password' : 'Password'
        throw new BadRequestError(INVALID_FORMAT.DEFAULT(responseMsg))
    }

    if (newPassword !== confirmPassword)
        throw new BadRequestError(INVALID_FORMAT.PASSWORD_MISMATCH)

    // I am using findOne here to use pre save hook:
    const user = await User.findOne({ _id: authenticatedUser });

    user.password = newPassword
    await user.save()

    res.status(StatusCodes.OK).json({ message: SUCCESS, user })
}

/**
 * Route Handler: updateUserProfile
 * PATCH /api/v2/users/me/update-profile
 */
exports.updateUserProfile = async (req, res) => {
    const { name, about, avatar } = req.body
    const authenticatedUser = req.user._id

    const user = await User.findByIdAndUpdate(
        authenticatedUser,
        { name, about },
        { new: true }
    )
    res.status(StatusCodes.OK).json({ message: SUCCESS, user })
}

/**
 * PATCH /api/v2/users/me/favorites/:id
 * Add/Remove a recipe to/from user favorites.
 */
exports.updateUserFavorites = async (req, res) => {
    const recipeId = req.params.id
    const authenticatedUser = req.user._id

    const favorites = req.user.favorites.map((obj) => obj.toString())
    const operator = favorites.includes(recipeId) ? "$pull" : "$addToSet"

    await User.findByIdAndUpdate(
        authenticatedUser,
        { [operator]: { favorites: recipeId } },
        { new: true }
    )

    res.status(StatusCodes.OK).json({ message: SUCCESS })
}

/**
 * DELETE /api/v2/users/:id/
 */
exports.deleteUser = async (req, res) => {
    const authenticatedUser = req.user?._id

    // Logged in user is dif from request id
    if (authenticatedUser.toString() !== req.params.id) {
        throw new UnauthorizedError(UNAUTHORIZED)
    }

    await Recipe.deleteMany({ author: authenticatedUser })
    await ShoppingList.deleteMany({ author: authenticatedUser })
    await User.deleteOne({ _id: authenticatedUser })

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