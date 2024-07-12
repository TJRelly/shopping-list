const express = require("express");
const items = require("./fakeDb");
const router = new express.Router();
const ExpressError = require("./expressError");

/** GET /items: get list of items */

router.get("/", function (req, res, next) {
    try {
        return res.send({ items });
    } catch (e) {
        next(e);
    }
});

/** POST /items: adds item to list of items */

router.post("/", function (req, res, next) {
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

router.get("/:name", function (req, res, next) {
    //Shows information on a single item
    try {
        const item = items.find((i) => i.name === req.params.name);
        if (!item) throw new ExpressError("Item not found", 404);
        res.status(200).json(item);
    } catch (e) {
        next(e);
    }
});

router.patch("/:name", function (req, res, next) {
    //updates information in a single item
    try {
        const item = items.find((i) => i.name === req.params.name);
        if (!item || !items.length)
            throw new ExpressError("Item not found", 404);
        item.name = req.body.name;
        item.price = req.body.price;
        res.json({ updated: item });
    } catch (e) {
        next(e);
    }
});

router.delete("/:name", function (req, res, next) {
    //deletes item from the list of items
    try {
        const item = items.findIndex((i) => i.name === req.params.name);
        if (item === -1) throw new ExpressError("Item not found", 404);
        prevItem = items[item];
        items.splice(item, 1);
        res.json({ deleted: prevItem });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
