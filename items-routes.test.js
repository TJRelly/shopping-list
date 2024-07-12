process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
let items = require("./fakeDb");

let item = { name: "testItem", price: 0 };

beforeEach(function () {
    items.push(item);
});

afterEach(function () {
    // make sure this *mutates*, not redefines, `cats`
    items.length = 0;
});

//   Tests

// - Getting all items
/** GET /items - returns `{items: [{name:..., price:...}]}` */

describe("GET /items", function () {
    test("Gets a list of items", async function () {
        const resp = await request(app).get(`/items`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            items: [{ name: "testItem", price: 0 }],
        });
        expect(items.length).toBe(1);
    });
});

// - Getting an item from the shopping list by name
//     - What finding successfully looks like
//     - What happens when it is not found

describe("GET /items/:name", function () {
    test("Gets a an item from list by name", async function () {
        const resp = await request(app).get(`/items/${item.name}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual(item);
        expect(items.length).toBe(1);
    });
});

// - Deleting an item
//     - What deleting successfully looks like
//     - What happens when it is not found

describe("DELETE /items/:name", function () {
    test("Deletes a an item from list by name", async function () {
        const resp = await request(app).delete(`/items/${item.name}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ deleted: item });
        expect(items.length).toBe(0);
    });

    test("Responds with 404 if item is found", async function () {
        const resp = await request(app).delete(`/items/notThere`);
        expect(resp.statusCode).toBe(404);
        expect(resp.body.error).toHaveProperty("message");
        expect(resp.body.error).toHaveProperty("status");
        expect(resp.body.error.message).toEqual("Item not found");
        expect(resp.body.error.status).toEqual(404);
    });
});

// - Adding an item
//     - What creating successfully looks like
//     - What happens when you create a duplicate item

describe("POST /items", function () {
    test("Creates a new item", async function () {
        const item = { name: "testItem2", price: 0 };
        const resp = await request(app).post(`/items`).send(item);
        expect(resp.statusCode).toBe(201);
        expect(resp.body.added).toHaveProperty("name");
        expect(resp.body.added).toHaveProperty("price");
        expect(resp.body.added.name).toEqual(item.name);
        expect(resp.body.added.price).toEqual(item.price);
        expect(items.length).toBe(2);
    });

    test("Responds with 400 (Bad Request) if no item is sent", async function () {
        const resp = await request(app).post(`/items`);
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error).toHaveProperty("message");
        expect(resp.body.error).toHaveProperty("status");
        expect(resp.body.error.message).toEqual(
            "Must enter a name and a price"
        );
        expect(resp.body.error.status).toEqual(400);
    });

    test("Responds with 400 (Bad Request) no price is sent", async function () {
        const item = { name: "testItem", price: 0 };
        const resp = await request(app).post(`/items`).send({
            name: item.name,
        });
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error).toHaveProperty("message");
        expect(resp.body.error).toHaveProperty("status");
        expect(resp.body.error.message).toEqual(
            "Must enter a name and a price"
        );
        expect(resp.body.error.status).toEqual(400);
    });

    test("Responds with 400 (Bad Request) no name is sent", async function () {
        const item = { name: "testItem", price: 0 };
        const resp = await request(app).post(`/items`).send({
            price: item.price,
        });
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error).toHaveProperty("message");
        expect(resp.body.error).toHaveProperty("status");
        expect(resp.body.error.message).toEqual(
            "Must enter a name and a price"
        );
        expect(resp.body.error.status).toEqual(400);
    });

    test("Responds with 400 (Bad Request) if item is already on the list", async function () {
        const item = { name: "testItem", price: 0 };
        const resp = await request(app).post(`/items`).send(item);
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error).toHaveProperty("message");
        expect(resp.body.error).toHaveProperty("status");
        expect(resp.body.error.message).toEqual("Item is already on list");
        expect(resp.body.error.status).toEqual(400);
    });
});

// - Updating an item
//     - What updating successfully looks like
//     - What happens when you create a duplicate item

describe("PATCH /items/:name", function () {
    test("Updates an existing item", async function () {
        let newItem = { name: "blueberry", price: 0 };
        const resp = await request(app)
            .patch(`/items/${item.name}`)
            .send(newItem);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.updated).toHaveProperty("name");
        expect(resp.body.updated).toHaveProperty("price");
        expect(resp.body.updated.name).toEqual(item.name);
        expect(resp.body.updated.price).toEqual(item.price);
        expect(items.length).toBe(1);
    });

    test("Responds with 404 if item is not on list", async function () {
        const resp = await request(app).patch(`/items/notOnList`);
        expect(resp.statusCode).toBe(404);
    });
});
