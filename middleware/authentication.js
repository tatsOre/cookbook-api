const JWT = require("../services/jwt")
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { UNAUTHORIZED } = require('../errors/response-messages')

const User = require('../ models/User')
// Create message for auth/forbidden
/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const authenticateBearerToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError(UNAUTHORIZED)
    }
    const token = authHeader.split(' ')[1]
    try {
        const payload = JWT.verify(token)
        req.user = payload.user
        next()
    } catch {
        throw new UnauthenticatedError(UNAUTHORIZED)
    }
}

module.exports = { authenticateBearerToken }
