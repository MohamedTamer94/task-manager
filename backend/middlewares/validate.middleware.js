const ApiError = require("../utils/ApiError");

const validate = (schemas = {}) => (req, res, next) => {
    const options = {
        abortEarly: false,      // collect all errors
        allowUnknown: true,     // allow extra fields
        stripUnknown: true,     // remove unknown keys
        convert: true,          // cast strings -> numbers, etc.
    }
    for (const [part, schema] of Object.entries(schemas)) {
        if (!schema) continue;
        
        const {value, error} = schema.validate(req[part], options);

        if (error) {
            return next(ApiError.badRequest("Validation failed", {
                code: "VALIDATION_ERROR",
                details: error.details.map((d) => ({
                    message: d.message,
                    path: Array.isArray(d.path) ? d.path.join(".") : String(d.path || ""),
                    type: d.type,
                })),
                cause: error
            }));
        }
    }
    next();
}

module.exports = validate;