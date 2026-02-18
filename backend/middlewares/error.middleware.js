const ApiError = require("../utils/ApiError");
const config = require("../config/env");

const normalizeMongooseErrors = (err) => {
    if (err?.name === "CastError" && err?.kind === "ObjectId") {
        return ApiError.badRequest("Invalid id format", {
            code: "INVALID_ID",
            details: [{ path: err.path, message: `Invalid ObjectId: ${err.value}` }],
            cause: err
        })
    }
    if (err?.name === "ValidationError" && err?.errors) {
        const details = Object.values(err.errors).map((e) => ({
            path: e.path,
            message: e.message,
            type: e.kind,
        }));
        return ApiError.badRequest("Model validation failed", {
            code: "MODEL_VALIDATION_ERROR",
            details: details,
            cause: err
        });
    }
    return null;
}

const errorMiddleware = (err, req, res, next) => {
    // normalize ApiError
    const isApiError = err instanceof ApiError;
    if (!isApiError) {
        const normalized = normalizeMongooseErrors(err);
        if (normalized) err = normalized;
    }

    const statusCode = isApiError ? err.statusCode : (typeof err.status === "number" ? err.status : 500);

    const message = isApiError ? err.message : (err.message || "Internal Server Error");

    const isOperational = isApiError ? err.isOperational : false; // mark any unknown error as non-operational

    const payload = {
        success: false,
        message: message
    }
    
    if (isApiError && err.code) payload.code = err.code;
    if (isApiError && err.details) payload.details = err.details;

    const isProd = config.nodeEnv === "production";
    
    if (!isProd) {
        payload.stack = err.stack;
        payload.error = {
            name: err.name,
            isOperational: isOperational,
        }
    }

    return res.status(statusCode).json(payload);
}

module.exports = errorMiddleware;