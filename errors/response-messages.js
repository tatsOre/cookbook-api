module.exports = {
    SUCCESS: "Success",
    UNAUTHORIZED: "Unauthorized", // missing/wrong token,
    NOT_FOUND: {
        DEFAULT: "Not Found",
        USER_NOT_FOUND: "User email does not exist",
    },
    TOO_MANY_REQUESTS: "Too many requests. Try again later.",
    INVALID_FORMAT: {
        MISSING_CREDENTIALS: "Please provide an email address and/or password",
        INVALID_CREDENTIALS: "Incorrect or missing password",
    },
    DUPLICATE_EMAIL: "This email is already associated with an account",
    INTERNAL_SERVER_ERROR: 'Something went wrong. Try again later.',
    SERVER_UNAVAILABLE: 'Maintenance is on. Try again later.'
}
