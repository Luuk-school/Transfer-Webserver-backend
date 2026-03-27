require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/auth");
const ping = require("./utils/ping");

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ping", ping);


// Health check (handig!) ((werkt niet ivm dat /api hier alleen na toe gaat))
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
