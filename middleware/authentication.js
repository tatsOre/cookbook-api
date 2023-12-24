const JWT = require("../services/jwt")
const {
    UnauthenticatedError, NotFoundError, UnauthorizedError
} = require('../errors')
const {
    FORBIDDEN, UNAUTHORIZED, NOT_FOUND
} = require('../errors/response-messages')

const User = require('../models/User')

/**
 * Middleware: authenticateUserCookieToken
 * 
 * @description Authenticates the user based on a JWT token stored in the cookie.
 *
 * @throws {UnauthenticatedError} If the JWT token is not present in the cookie.
 * @throws {UnauthorizedError} If the JWT token cannot be verified.
 * @throws {NotFoundError} If the user associated with the decoded token is not found.
 * 
 * @returns {void}
 */
const authenticateUserCookieToken = async (req, res, next) => {
    const token = req.cookies[process.env.COOKIE_SECRET]

    if (!token) throw new UnauthenticatedError(UNAUTHORIZED)

    const decoded = JWT.verify(token)

    if (!decoded) throw new UnauthorizedError(UNAUTHORIZED)

    const user = await User.findById(decoded.user._id)

    if (!user) throw new NotFoundError(NOT_FOUND.USER_NOT_FOUND)

    req.user = user

    next()
}

/**
 * Middleware: verifyUserCookieToken
 * 
 * @description Verifies a JWT token stored in the cookie and attaches
 * the user ID to the request object.
 * 
 * @returns {void}
 */
const verifyUserCookieToken = async (req, res, next) => {
    const token = req.cookies[process.env.COOKIE_SECRET]
    // If the JWT token is not present in the cookie or decoded token is not valid, req.user == null
    const decoded = token && JWT.verify(token)

    req.user = decoded ? decoded.user : null

    next()
}

/**
 * Middleware: verifyAuthorization
 * 
 * @description Verifies if the authenticated user is authorized to perform an action on a recipe.
 * 
 * @throws {UnauthorizedError} If the authenticated user is not the author of the recipe.
 * 
 * @returns {void}
 */
const verifyAuthorization = async (req, res, next) => {
    const authenticatedUser = req.user._id.toString()

    const author = req.recipe.author._id.toString()

    if (!author || author !== authenticatedUser) {
        throw new UnauthorizedError(FORBIDDEN)
    }

    next()
}

/**
 * Middleware: authenticateUserBearerToken
 */

const authenticateUserBearerToken = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError(UNAUTHORIZED)
    }
    const token = authHeader.split(' ')[1]

    const decoded = JWT.verify(token)

    if (!token || !decoded) throw new UnauthenticatedError(UNAUTHORIZED)

    const user = await User.findById(decoded.user._id)

    if (!user) throw new NotFoundError(NOT_FOUND.USER_NOT_FOUND)

    req.user = user

    next()
}

module.exports = {
    authenticateUserBearerToken,
    authenticateUserCookieToken,
    verifyAuthorization,
    verifyUserCookieToken
}
