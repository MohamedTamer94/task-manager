class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {object} [options]
     * @param {boolean} [options.isOperational=true] - Expected / handled error
     * @param {any} [options.details] - Extra debug / validation info
     * @param {string} [options.code] - App-specific error code (optional)
     * @param {Error} [options.cause] - Underlying error (optional)
     */
    constructor(statusCode, message, options = {}) {
        super(message);

        const {
            isOperational = true,
            details,
            code,
            cause
        } = options;

        this.name = "ApiError";
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        this.code = code;

        if (cause) this.cause = cause;

        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad Request", options) {
        return new ApiError(400, message, options);
    }

    static notFound(message = "Not Found", options) {
        return new ApiError(404, message, options);
    }

    static internalError(message = "Internal Server Error", options) {
        return new ApiError(500, message, options);
    }
}

module.exports = ApiError;