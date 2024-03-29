module.exports = {
    SUCCESS: "Success",
    FAILURE: "Failure",
    UNAUTHORIZED: "Unauthorized", // missing/wrong token,
    FORBIDDEN: "Forbidden",
    NOT_FOUND: {
        DEFAULT: "Not Found",
        USER_NOT_FOUND: "Sorry, we don't recognize this account.",
        RESOURCE_NOT_FOUND: (id) => `No resource found with id: ${id}`
    },
    TOO_MANY_REQUESTS: "Too many requests. Try again later.",
    INVALID_FORMAT: {
        DEFAULT: (field) => `The following required fields are missing: ${field}`,
        MISSING_CREDENTIALS: "Please provide an email address and/or password.",
        INVALID_CREDENTIALS: "Wrong or missing password.",
        PASSWORD_MISMATCH: "Password and Confirm Password do not match. Try again!"

    },
    DUPLICATE_EMAIL: "This email is already associated with an account.",
    INTERNAL_SERVER_ERROR: 'Something went wrong. Try again later.',
    SERVER_UNAVAILABLE: 'Maintenance is on. Try again later.'
}
//Wrong password. Try again or click Forgot password to reset it.