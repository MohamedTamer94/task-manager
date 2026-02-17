// load environmental variables
require("dotenv").config();
const config = require("./config/env")
const express = require("express");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/tasks.route")
const app = express();
const port = config.port;

app.use(express.json());

// setup routes
app.use('/api/tasks', taskRoutes);

app.get("/health", (req, res) => {
    return res.status(200).json({status: "ok"})
})

// start listening on the specified port and connect to DB
async function start() {
    await connectDB();
    app.listen(port, () => {
        // connect to Mongo DB
        console.log(`Task Manager app is running on ${port}`)
    })
}

start();