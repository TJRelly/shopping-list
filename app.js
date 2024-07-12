const express = require("express");
const ExpressError = require("./expressError");
const routes = require("./routes/items-routes");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/items", routes);

// If no other route matches, respond with a 404
app.use((req, res, next) => {
    const e = new ExpressError("Page Not Found", 404);
    next(e);
});

// Error handler
app.use(function (err, req, res, next) {
    //Note the 4 parameters!
    // the default status is 500 Internal Server Error
    let status = err.status || 500;
    let message = err.msg;

    // set the status and alert the user
    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;
