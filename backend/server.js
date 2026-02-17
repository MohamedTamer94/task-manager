// load environmental variables
require("dotenv").config();
const { config } = require("./config/env")
const express = require("express");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/tasks.route")
const app = express();
const port = config.port;

// setup routes
app.use('/api/tasks', taskRoutes);

app.get("/health", (req, res) => {
    return res.status(200).json({status: "ok"})
})

// connect to Mongo DB
connectDB();

// start listening on the specified port
app.listen(port, () => {
    console.log(`Task Manager app is running on ${port}`)
})