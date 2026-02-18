// load environmental variables
require("dotenv").config();
const config = require("./config/env")
const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db");
const taskRoutes = require("./routes/tasks.route");
const notFoundMiddleware = require("./middlewares/notfound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const app = express();
const port = config.port;

app.use(express.json());

app.use(cors({
  origin: config.allowedOrigin
}))

// setup routes
app.use('/api/tasks', taskRoutes);

app.get("/health", (req, res) => {
    return res.status(200).json({status: "ok"})
});

app.use(notFoundMiddleware);

app.use(errorMiddleware);

// handle any uncaught exceptions or rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// start listening on the specified port and connect to DB
async function start() {
    await connectDB();
    app.listen(port, () => {
        // connect to Mongo DB
        console.log(`Task Manager app is running on ${port}`)
    })
}

start();