const mongoose = require("mongoose");
const config = require("./env")
const databaseUrl = config.databaseUrl;


// connect to Mongo Databse
async function connectDB() {
    try {
        await mongoose.connect(databaseUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("MongoDB connected successfully.")
    } catch (e) {
        // connection to DB failed, exit immediately
        console.error(e.message);
        process.exit(1);
    }
}

module.exports = connectDB;