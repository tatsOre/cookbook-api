const JWT = require("../services/jwt")
const { UnauthenticatedError, NotFoundError, UnauthorizedError } = require('../errors')
const { UNAUTHORIZED, NOT_FOUND } = require('../errors/response-messages')

const User = require('../models/User')

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
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

const authenticateUserCookieToken = async (req, res, next) => {
    const token = req.cookies[process.env.COOKIE_SECRET]

    const decoded = JWT.verify(token)

    if (!token || !decoded) throw new UnauthorizedError(UNAUTHORIZED)

    const user = await User.findById(decoded.user._id)

    if (!user) throw new NotFoundError(NOT_FOUND.USER_NOT_FOUND)

    req.user = user

    next()
}

module.exports = { 
    authenticateUserBearerToken,
    authenticateUserCookieToken
 }
