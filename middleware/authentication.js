const jwt = require("jsonwebtoken")
const User = require('../ models/User')

/**
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const authenticateBearerToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new Error('Unauthenticated')
    }
    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload.user
        next()
    } catch (error) {
        throw new Error('Unauthenticated')
    }
}

module.exports = { authenticateBearerToken }
