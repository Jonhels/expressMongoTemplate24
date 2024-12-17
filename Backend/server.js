require("dotenv").config();
const express = require("express");
const dbConnect = require("./config/dbConnect");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

// Import routes from the routes folder
const userRoutes = require("./routes/userRoute");

// const route = require("./routes/route");
const app = express(); // Create an express app
app.use(logger("tiny")); // Log http request to the console
app.use(helmet()); // Secure the app through different HTTP headers

// Parse incoming requests to JSON
app.use(bodyParser.json());
// {}
// Connect to the database and start the server
dbConnect().then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);  
    });
});

// cors
const whitelist = ["http://localhost:3000", process.env.FRONTEND_URL] // Array of allowed origins
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Template routes
app.use("/api/users", userRoutes);

// Shutdown gracefully
const gracefulShutdown = async () => {
    console.log("Shutting down gracefully...");
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Listen for ctrl+C
process.on("SIGTERM", gracefulShutdown); // Listen for the SIGTERM (process manager shutdown process)