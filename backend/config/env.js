const joi = require("joi");
const schema = joi.object({
    NODE_ENV: joi.string().valid('development', 'production').default('development'),

    PORT: joi.number().integer().min(1).max(65535).default(3001),

    DATABASE_URL: joi.string().uri().required(),

    ALLOWED_ORIGIN: joi.string().uri().default("http://localhost:5173")
}).unknown(true);

const { value, error } = schema.validate(process.env, {
    abortEarly: false, // show all errors once
    convert: true, // so "3000" for example can be converted to 3000 (number),
    stripUnknown: true
});

if (error) {
    console.error("Invalid environment variables:");
    for (const detail of error.details) {
        console.error(` - ${detail.message}`);
    }
    process.exit(1);
}

module.exports = {
    databaseUrl: value.DATABASE_URL,
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    allowedOrigin: value.ALLOWED_ORIGIN
};