const { StatusCodes } = require('http-status-codes')
const JWT = require('../services/jwt');
const { BadRequestError, UnauthenticatedError } = require('../errors')
const {
    DUPLICATE_EMAIL, INVALID_FORMAT, NOT_FOUND, SUCCESS
} = require('../errors/response-messages')

const User = require("../models/User");

/**
 * POST /api/v2/auth/register
 * Registers user in DB.
 */
const register = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError(INVALID_FORMAT.MISSING_CREDENTIALS)
    }
    let user = await User.findOne({ email })

    if (user) {
        throw new BadRequestError(DUPLICATE_EMAIL)
    }
    user = await User.create({ email, password })

    res.status(StatusCodes.CREATED).send({ message: SUCCESS })
}

/**
 * POST /api/v2/auth/login
 * Login user - local login with email and password.
 */
const login = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError(INVALID_FORMAT.MISSING_CREDENTIALS)
    }
    let user = await User.findOne({ email })

    if (!user) {
        throw new UnauthenticatedError(NOT_FOUND.USER_NOT_FOUND)
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new UnauthenticatedError(INVALID_FORMAT.INVALID_CREDENTIALS)
    }
    req.user = user
    next()
}

const setAuthJWTCookie = (req, res) => {
    const payload = req.user && req.user.toAuthObject()

    const token = JWT.sign(payload)

    res.status(StatusCodes.OK)
        .cookie(process.env.COOKIE_SECRET, token, {
            expires: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "development" ? false : true
        })
        .send({ message: SUCCESS })
}

/**
 * GET /api/v2/auth/logout
 */
const logout = async (req, res) => {
    res.status(StatusCodes.OK).send({ message: SUCCESS })
}

module.exports = { register, login, logout, setAuthJWTCookie }
