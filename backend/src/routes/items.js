const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DATA_PATH =
  process.env.ITEMS_DATA_PATH ||
  path.join(__dirname, "../../../data/items.json");

async function readData() {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    if (!data) {
      const error = new Error("Error reading items data.");
      error.status = 500;
      return next(error);
    }
    let { limit, page, q } = req.query;
    let results = data;

    if (q) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    const total = results.length;
    limit = Math.max(1, parseInt(limit) || 10);
    page = Math.max(1, parseInt(page) || 1);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = results.slice(start, end);

    res.json({ items: paginated, total });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    if (!data) {
      const error = new Error("Error reading items data.");
      error.status = 500;
      return next(error);
    }
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.set("Cache-Control", "no-store");
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const item = req.body;
    if (
      !item.name ||
      typeof item.name !== "string" ||
      !item.category ||
      typeof item.category !== "string" ||
      typeof item.price !== "number" ||
      isNaN(item.price) ||
      item.price < 0
    ) {
      return res.status(400).json({ error: "Invalid item data." });
    }
    const data = await readData();
    if (!data) {
      const error = new Error("Error reading items data.");
      error.status = 500;
      return next(error);
    }
    item.id = Date.now();
    data.push(item);
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
