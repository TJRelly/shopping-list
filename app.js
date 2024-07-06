const express = require("express");
const ExpressError = require("./expressError");
const items = require("./fakeDb");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/items", function (req, res, next) {
    try {
        return res.send({ items });
    } catch (e) {
        next(e);
    }
});

app.post("/items", function (req, res, next) {
    try {
        //Throw error if no name or price is submitted
        if (req.body.name === undefined || req.body.price === undefined)
            throw new ExpressError("Must enter a name and a price", 400);

        const item = items.find((i) => i.name === req.body.name);

        //Handle duplicate items on post request
        if (item !== undefined)
            throw new ExpressError("Item is already on list", 400);

        const newItem = { name: req.body.name, price: req.body.price };
        items.push(newItem);

        return res.status(201).json({ added: newItem });
    } catch (e) {
        return next(e);
    }
});

app.get("/items/:name", function (req, res, next) {
    //Shows information on a single item
    try {
        const item = items.find((i) => i.name === req.params.name);
        if (item === undefined) throw new ExpressError("Item not found", 404);
        res.json(item);
    } catch (e) {
        next(e);
    }
});

app.patch("/items/:name", function (req, res, next) {
    //updates information in a single item
    try {
        const item = items.find((i) => i.name === req.params.name);
        if (item === undefined) throw new ExpressError("Item not found", 404);
        item.name = req.body.name;
        item.price = req.body.price;
        res.json({ updated: item });
    } catch (e) {
        next(e);
    }
});

app.delete("/items/:name", function (req, res, next) {
    //updates information in a single item
    try {
        const item = items.findIndex((i) => i.name === req.params.name);
        if (item === -1) throw new ExpressError("Item not found", 404);
        prevItem = items[item];
        items.splice(item, 1);
        res.json({ deleted: prevItem});
    } catch (e) {
        next(e);
    }
});

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

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
