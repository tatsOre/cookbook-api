const { StatusCodes } = require('http-status-codes')

/**
 * Status codes documentation
 * https://github.com/prettymuchbryce/http-status-codes/blob/master/src/status-codes.ts
 */

class CustomAppError extends Error {
    constructor(message) {
        super(message)
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

class BadRequestError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}

class UnauthenticatedError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.FORBIDDEN
    }
}

module.exports = {
    CustomAppError,
    BadRequestError,
    NotFoundError,
    UnauthenticatedError,
    UnauthorizedError
}
