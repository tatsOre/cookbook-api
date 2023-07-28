const jwt = require("jsonwebtoken");
const { StatusCodes } = require('http-status-codes')
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require('../errors')
const {
    DUPLICATE_EMAIL, INVALID_FORMAT, NOT_FOUND
} = require('../errors/response-messages')

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
    user = await User.create({
        email,
        password
    })
    res
        .status(StatusCodes.CREATED)
        .send({ message: `New user inserted: ${user._id}` })
}

/**
 * POST /api/v2/auth/login
 * Login a user - local login.
 */
const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new BadRequestError(INVALID_FORMAT.MISSING_CREDENTIALS)
    }
    let user = await User.findOne({ email })

    if (!user) {
        throw new UnauthenticatedError(NOT_FOUND.USER_NOT_FOUND)
    }

    const isPassportValid = await user.comparePassword(password)
    if (!isPassportValid) {
        throw new UnauthenticatedError(INVALID_FORMAT.INVALID_CREDENTIALS)
    }
    const payload = user.toAuthObject()

    const token = signJWT(payload)

    res.status(StatusCodes.OK)
        .cookie(process.env.COOKIE_SECRET, token, {
            expires: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "development",
        })
        .send({ message: 'Success' })
}

/**
 * Set JWT Cookie and send user main info.
 * Make this two functions utils
 */
const signJWT = (payload) => {
    const token = jwt.sign(
        { user: payload, iat: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    )
    return token;
}

const verifyJWT = (token) => jwt.verify(
    token,
    process.env.JWT_SECRET,
    function (error, decoded) {
        return error ? null : decoded
    }
);

const getUserFromJWT = (req) => {
    let token = "";
    if (req && req.cookies) {
        token = req.cookies[process.env.COOKIE_SECRET];
    }
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, decoded) => {
            if (error) return null;
            return decoded;
        }
    );
    return decoded;
};


/**
 * GET /api/v1/auth/logout
 */
const logout = async (req, res) => {
    // todo: blacklist with redis
    res.status(StatusCodes.OK).json({ msg: "Success" })
}

module.exports = { register, login, logout, signJWT, verifyJWT }
