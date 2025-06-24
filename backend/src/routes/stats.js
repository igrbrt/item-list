const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const DATA_PATH =
  process.env.ITEMS_DATA_PATH ||
  path.join(__dirname, "../../../data/items.json");

let statsCache = null;

function calcStats(items) {
  return {
    total: items.length,
    averagePrice: items.length
      ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
      : 0,
  };
}

function updateStatsCache() {
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) {
      console.error("Error reading stats file:", err.message);
      statsCache = null;
      return;
    }
    try {
      const items = JSON.parse(raw);
      statsCache = calcStats(items);
    } catch (e) {
      console.error("Error parsing stats file:", e.message);
      statsCache = null;
    }
  });
}

updateStatsCache();

fs.watch(DATA_PATH, (eventType) => {
  if (eventType === "change") {
    updateStatsCache();
  }
});

router.get("/", (req, res, next) => {
  if (!statsCache) {
    updateStatsCache();
    return res
      .status(503)
      .json({ error: "Stats not available. Try again later." });
  }
  res.json(statsCache);
});

module.exports = router;
