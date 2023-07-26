const { StatusCodes } = require("http-status-codes")
const CustomErrorMsgs = require('../errors/response-messages')

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || CustomErrorMsgs.INTERNAL_SERVER_ERROR
    }

    // Mongoose Validation Errors Msgs
    if (err.name === "ValidationError") {
        customError.statusCode = StatusCodes.BAD_REQUEST
        customError.message = Object.values(err.errors).map(val => val.message).join(', ')
    }

    // MongoDB Duplicate Keys
    if (err.name === "MongoServerError" && err.code === 11000) {
        customError.statusCode = StatusCodes.BAD_REQUEST
        customError.message = `Duplicate value(s) entered for ${Object.keys(err.keyValue)} field(s).`
    }

    // MongoDB wrong _id values:
    if (err.name === "CastError") {
        customError.statusCode = StatusCodes.NOT_FOUND
        customError.message = `No resource found with id: ${err.value}`
    }
    return res.status(customError.statusCode).json({ message: customError.message })
}

module.exports = errorHandlerMiddleware
