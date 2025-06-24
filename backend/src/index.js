const express = require("express");
const morgan = require("morgan");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");
const cors = require("cors");
const { getCookie, notFound } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

app.use("*", notFound);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.set("Content-Type", "application/json");
  res.status(status).json({ error: err.message || "Internal server error" });
});

getCookie();

app.listen(port, () =>
  console.log("Backend running on http://localhost:" + port)
);
