const request = require("supertest");
const express = require("express");
const fs = require("fs");
const path = require("path");

process.env.ITEMS_DATA_PATH = path.join(
  __dirname,
  "../../../data/items.test.json"
);

const TEST_DATA_PATH = process.env.ITEMS_DATA_PATH;

function resetTestData() {
  const initialData = [
    { id: 1, name: "Test Item 1", category: "Cat1", price: 100 },
    { id: 2, name: "Test Item 2", category: "Cat2", price: 200 },
  ];
  fs.writeFileSync(TEST_DATA_PATH, JSON.stringify(initialData, null, 2));
}

describe("Items API", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/items", require("../routes/items"));
  });

  beforeEach(() => {
    resetTestData();
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DATA_PATH)) fs.unlinkSync(TEST_DATA_PATH);
  });

  test("GET /api/items returns all items", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(2);
    expect(typeof res.body.total).toBe("number");
  });

  test("GET /api/items/:id returns existing item", async () => {
    const res = await request(app).get("/api/items/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("name", "Test Item 1");
  });

  test("GET /api/items/:id returns 404 for non-existent item", async () => {
    const res = await request(app).get("/api/items/999");
    expect(res.status).toBe(404);
  });

  test("POST /api/items adds new item", async () => {
    const newItem = { name: "New", category: "Cat3", price: 300 };
    const res = await request(app).post("/api/items").send(newItem);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "New");

    const getRes = await request(app).get("/api/items");
    expect(getRes.body.items.length).toBe(3);
  });

  test("POST /api/items returns 400 for invalid payload (missing fields)", async () => {
    const res = await request(app).post("/api/items").send({ name: "X" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/items returns 400 for negative price", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "X", category: "C", price: -10 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/items returns 400 for non-numeric price", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ name: "X", category: "C", price: "abc" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /api/items accepts invalid limit and page and corrects to minimum 1", async () => {
    const res = await request(app).get("/api/items?limit=0&page=-5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});
