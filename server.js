require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConfig");
const PORT = process.env.port || 3000;

// connect DB
connectDB();
// Custom Middleware Logger
app.use(logger);
// CORS
app.use(cors(corsOptions));

// built in middleware to handel urlencoded data
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// To handel static files in main and Sub Dir
app.use("/",express.static(path.join(__dirname, "/public")));

// Root Route
app.use("/", require("./routes/root"));
// API Route
app.use("/states", require("./routes/api/states"));

// 404 Route for un-defined 
app.all( "*", (req,res) => { 
    res.status(404)
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname, "views","404.html"));
    }else if(req.accepts("json")){
            res.json({error: "404 Not Found"});
    } else { res.type("text").send("404 Not Found")}
    
});
// Error Logger
app.use(errorHandler);

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});